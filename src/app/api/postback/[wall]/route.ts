import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractPostbackParams, validateSignature } from '@/lib/postback';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wall: string }> }
) {
  const { wall } = await params;
  const searchParams = request.nextUrl.searchParams;

  // 1. Load offerwall config
  const offerWall = await prisma.offerWall.findUnique({ where: { slug: wall } });
  if (!offerWall || !offerWall.isActive) {
    return new Response('0', { status: 404 });
  }

  // 2. Extract params using per-wall mapping
  const postbackParams = extractPostbackParams(wall, searchParams);
  if (!postbackParams) {
    console.error(`[Postback] Invalid params for ${wall}:`, Object.fromEntries(searchParams));
    return new Response('0', { status: 400 });
  }

  // 3. Validate signature
  const isValid = validateSignature(wall, offerWall.postbackSecret, searchParams);
  if (!isValid) {
    console.error(`[Postback] Invalid signature for ${wall}, txn: ${postbackParams.externalId}`);
    // Log rejected postback
    await prisma.postback.create({
      data: {
        offerWallId: offerWall.id,
        userId: postbackParams.userId,
        externalId: `rejected_${postbackParams.externalId}_${Date.now()}`,
        payoutCents: postbackParams.payoutCents,
        status: 'REJECTED',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        rawPayload: Object.fromEntries(searchParams),
      },
    }).catch(() => {}); // Don't fail if logging fails
    return new Response('0', { status: 403 });
  }

  // 4. Idempotency check
  const existing = await prisma.postback.findUnique({
    where: {
      offerWallId_externalId: {
        offerWallId: offerWall.id,
        externalId: postbackParams.externalId,
      },
    },
  });
  if (existing) {
    // Already processed — return success (idempotent)
    return new Response('1');
  }

  // 5. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: postbackParams.userId },
  });
  if (!user) {
    console.error(`[Postback] User not found: ${postbackParams.userId}`);
    return new Response('0', { status: 404 });
  }

  // 6. Apply payout multiplier
  const payoutCents = Math.round(postbackParams.payoutCents * offerWall.payoutMultiplier);

  // 7. Atomic credit: create postback + transaction + update balance
  try {
    await prisma.$transaction(async (tx) => {
      const newBalance = user.balanceCents + payoutCents;

      const postback = await tx.postback.create({
        data: {
          offerWallId: offerWall.id,
          userId: user.id,
          externalId: postbackParams.externalId,
          offerId: postbackParams.offerId,
          offerName: postbackParams.offerName,
          payoutCents,
          status: 'CREDITED',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          rawPayload: Object.fromEntries(searchParams),
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'EARNING',
          amountCents: payoutCents,
          balanceAfterCents: newBalance,
          source: offerWall.slug,
          description: `${offerWall.name}: ${postbackParams.offerName || 'Offer completed'}`,
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
    });

    console.log(`[Postback] Credited ${payoutCents}c to user ${user.id} from ${wall}`);
    return new Response('1');
  } catch (error) {
    console.error(`[Postback] Transaction failed:`, error);
    return new Response('0', { status: 500 });
  }
}
