import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { REFERRAL_COMMISSION_RATE } from '@/lib/referral';
import { getCurrentPeriods } from '@/lib/leaderboard';
import { checkAndAwardAchievements } from '@/lib/achievements';
import { sendEarningCreditedEmail } from '@/lib/email';

const FLAT_PAYOUT_CENTS = 1000; // $10 per completed offer

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // 1. Validate security token
  const securityToken = searchParams.get('security_token');
  const expectedToken = process.env.EVERFLOW_POSTBACK_SECRET;
  if (expectedToken && securityToken !== expectedToken) {
    console.error('[Everflow Postback] Invalid security token');
    return new Response('0', { status: 403 });
  }

  // 2. Extract params (Everflow standard postback format)
  const userId = searchParams.get('sub1');
  const externalId = searchParams.get('transaction_id') || searchParams.get('adv_event_id');
  const payoutRaw = searchParams.get('payout') || searchParams.get('amount');
  const offerId = searchParams.get('offer_id');

  if (!userId || !externalId) {
    console.error('[Everflow Postback] Missing required params:', Object.fromEntries(searchParams));
    return new Response('0', { status: 400 });
  }

  // 3. Look up which offerwall this belongs to via Everflow offer ID
  let offerWall = offerId
    ? await prisma.offerWall.findFirst({ where: { everflowOfferId: offerId, isActive: true } })
    : null;

  // Fallback: use the first active wall if offer_id doesn't match
  if (!offerWall) {
    offerWall = await prisma.offerWall.findFirst({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  if (!offerWall) {
    console.error('[Everflow Postback] No active offerwall found');
    return new Response('0', { status: 404 });
  }

  // 4. Idempotency check
  const existing = await prisma.postback.findUnique({
    where: {
      offerWallId_externalId: {
        offerWallId: offerWall.id,
        externalId,
      },
    },
  });
  if (existing) {
    return new Response('1');
  }

  // 5. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, balanceCents: true, referredById: true, email: true, name: true },
  });
  if (!user) {
    console.error(`[Everflow Postback] User not found: ${userId}`);
    return new Response('0', { status: 404 });
  }

  // 6. Determine payout: flat $10 (default) or actual Everflow payout * multiplier
  const actualPayoutCents = payoutRaw ? Math.round(parseFloat(payoutRaw) * 100) : 0;
  const useActualPayout = process.env.EVERFLOW_USE_ACTUAL_PAYOUT === 'true';
  const payoutCents = useActualPayout && actualPayoutCents > 0
    ? Math.round(actualPayoutCents * offerWall.payoutMultiplier)
    : FLAT_PAYOUT_CENTS;

  try {
    await prisma.$transaction(async (tx) => {
      const newBalance = user.balanceCents + payoutCents;

      const postback = await tx.postback.create({
        data: {
          offerWallId: offerWall.id,
          userId: user.id,
          externalId,
          offerId: offerId ?? undefined,
          payoutCents,
          status: 'CREDITED',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          rawPayload: {
            ...Object.fromEntries(searchParams),
            actualPayoutCents,
          },
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'EARNING',
          amountCents: payoutCents,
          balanceAfterCents: newBalance,
          source: offerWall.slug,
          description: `${offerWall.name}: Offer completed — $${(payoutCents / 100).toFixed(2)} earned!`,
          status: 'COMPLETED',
          postbackId: postback.id,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          balanceCents: { increment: payoutCents },
          lifetimeCents: { increment: payoutCents },
        },
      });

      // Leaderboard
      const periods = getCurrentPeriods();
      for (const period of [periods.weekly, periods.monthly]) {
        await tx.leaderboardEntry.upsert({
          where: { userId_period: { userId: user.id, period } },
          create: { userId: user.id, period, earnedCents: payoutCents },
          update: { earnedCents: { increment: payoutCents } },
        });
      }

      // Achievements
      await checkAndAwardAchievements(tx, user.id);

      // In-app notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'offer_complete',
          title: `You earned $${(payoutCents / 100).toFixed(2)}!`,
          message: `Your offer on ${offerWall.name} was completed. $${(payoutCents / 100).toFixed(2)} has been added to your balance.`,
          data: { postbackId: postback.id, wallSlug: offerWall.slug, amountCents: payoutCents },
        },
      });

      // Funnel event
      await tx.funnelEvent.create({
        data: {
          userId: user.id,
          event: 'offer_complete',
          metadata: { wall: offerWall.slug, externalId, amountCents: payoutCents },
        },
      });
    });

    // Send earning email (fire-and-forget)
    if (user.email) {
      sendEarningCreditedEmail(
        user.email,
        user.name,
        payoutCents,
        offerWall.name
      ).catch(() => {});
    }

    // Referral bonus (separate transaction)
    if (user.referredById) {
      try {
        const referralBonus = Math.round(payoutCents * REFERRAL_COMMISSION_RATE);
        if (referralBonus > 0) {
          await prisma.$transaction(async (tx) => {
            const referrer = await tx.user.findUnique({ where: { id: user.referredById! } });
            if (!referrer) return;

            await tx.referralEarning.create({
              data: {
                referrerId: referrer.id,
                referredUserId: user.id,
                sourceTransactionId: `everflow_${externalId}`,
                amountCents: referralBonus,
              },
            });

            await tx.transaction.create({
              data: {
                userId: referrer.id,
                type: 'BONUS',
                amountCents: referralBonus,
                balanceAfterCents: referrer.balanceCents + referralBonus,
                source: 'referral',
                description: `Referral bonus from ${offerWall.name}`,
                status: 'COMPLETED',
              },
            });

            await tx.user.update({
              where: { id: referrer.id },
              data: {
                balanceCents: { increment: referralBonus },
                lifetimeCents: { increment: referralBonus },
              },
            });
          });
        }
      } catch (err) {
        console.error('[Everflow Postback] Referral bonus failed:', err);
      }
    }

    console.log(`[Everflow Postback] Credited $${(payoutCents / 100).toFixed(2)} to user ${user.id} from ${offerWall.slug}`);
    return new Response('1');
  } catch (error) {
    console.error('[Everflow Postback] Transaction failed:', error);
    return new Response('0', { status: 500 });
  }
}
