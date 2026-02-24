import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { REFERRAL_COMMISSION_RATE } from '@/lib/referral';
import { checkAndAwardAchievements } from '@/lib/achievements';
import { getLocationFromIP, parseUserAgent } from '@/lib/geolocation';

const surveySchema = z.object({
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  timeAvailable: z.string().optional(),
});

const SIGNUP_BONUS_CENTS = 500; // $5.00

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const data = surveySchema.parse(body);

  // Atomic: create survey + credit bonus + mark onboarding done
  try {
    await prisma.$transaction(async (tx) => {
      // Check if already completed
      const existing = await tx.surveyResponse.findUnique({
        where: { userId: session.user.id },
      });
      if (existing?.bonusCredited) {
        throw new Error('Survey already completed');
      }

      // Create or update survey response
      await tx.surveyResponse.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          ...data,
          completedAt: new Date(),
          bonusCredited: true,
        },
        update: {
          ...data,
          completedAt: new Date(),
          bonusCredited: true,
        },
      });

      // Get current balance for the transaction record
      const user = await tx.user.findUniqueOrThrow({ where: { id: session.user.id } });
      const newBalance = user.balanceCents + SIGNUP_BONUS_CENTS;

      // Credit signup bonus
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'BONUS',
          amountCents: SIGNUP_BONUS_CENTS,
          balanceAfterCents: newBalance,
          source: 'signup_bonus',
          description: 'Welcome bonus for completing your profile',
          status: 'COMPLETED',
        },
      });

      // Update user balance and onboarding status
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          balanceCents: { increment: SIGNUP_BONUS_CENTS },
          lifetimeCents: { increment: SIGNUP_BONUS_CENTS },
          onboardingDone: true,
        },
      });

      // Credit referral bonus to referrer if applicable
      if (user.referredById) {
        const referralBonus = Math.round(SIGNUP_BONUS_CENTS * REFERRAL_COMMISSION_RATE);
        if (referralBonus > 0) {
          const referrer = await tx.user.findUnique({ where: { id: user.referredById } });
          if (referrer) {
            await tx.transaction.create({
              data: {
                userId: referrer.id,
                type: 'BONUS',
                amountCents: referralBonus,
                balanceAfterCents: referrer.balanceCents + referralBonus,
                source: 'referral',
                description: `Referral bonus: friend completed signup`,
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
          }
        }
      }

      // Funnel event
      await tx.funnelEvent.create({
        data: {
          userId: session.user.id,
          event: 'survey_complete',
          metadata: data,
        },
      });

      await checkAndAwardAchievements(tx, session.user.id);
    });

    // IP geolocation + device detection (fire-and-forget, outside transaction)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '';
    const ua = request.headers.get('user-agent');

    Promise.all([
      getLocationFromIP(ip),
      Promise.resolve(parseUserAgent(ua)),
    ]).then(async ([geo, device]) => {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ipCountry: geo.country,
          ipRegion: geo.region,
          ipCity: geo.city,
          ipZipcode: geo.zipcode,
          deviceType: device.deviceType,
          browser: device.browser,
          os: device.os,
        },
      });
    }).catch((err) => {
      console.error('Geolocation/device detection failed:', err);
    });

  } catch (err) {
    if (err instanceof Error && err.message === 'Survey already completed') {
      return NextResponse.json({ error: 'Survey already completed' }, { status: 409 });
    }
    console.error('Survey error:', err);
    return NextResponse.json({ error: 'Failed to save survey' }, { status: 500 });
  }

  return NextResponse.json({ success: true, bonusCents: SIGNUP_BONUS_CENTS });
}
