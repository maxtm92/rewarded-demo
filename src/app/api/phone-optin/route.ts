import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkAndAwardAchievements } from '@/lib/achievements';

const phoneSchema = z.object({
  phone: z.string().min(7).max(20),
});

const PHONE_OPTIN_BONUS_CENTS = 500; // $5.00

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { phone } = phoneSchema.parse(body);

  // Check if already claimed
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phoneOptInBonus: true, balanceCents: true },
  });

  if (user?.phoneOptInBonus) {
    return NextResponse.json({ error: 'Phone bonus already claimed' }, { status: 409 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUniqueOrThrow({ where: { id: session.user.id } });
      const newBalance = currentUser.balanceCents + PHONE_OPTIN_BONUS_CENTS;

      // Update user with phone and opt-in
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          phone,
          marketingSmsOptIn: true,
          phoneOptInBonus: true,
        },
      });

      // Credit bonus
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'BONUS',
          amountCents: PHONE_OPTIN_BONUS_CENTS,
          balanceAfterCents: newBalance,
          source: 'phone_optin',
          description: 'Phone number opt-in bonus',
          status: 'COMPLETED',
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          balanceCents: { increment: PHONE_OPTIN_BONUS_CENTS },
          lifetimeCents: { increment: PHONE_OPTIN_BONUS_CENTS },
        },
      });

      // Funnel event
      await tx.funnelEvent.create({
        data: {
          userId: session.user.id,
          event: 'phone_optin',
          metadata: { bonusCents: PHONE_OPTIN_BONUS_CENTS },
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'phone_bonus',
          title: 'You earned $5!',
          message: 'Thanks for adding your phone number. $5 has been added to your balance.',
          data: { amountCents: PHONE_OPTIN_BONUS_CENTS },
        },
      });

      await checkAndAwardAchievements(tx, session.user.id);
    });

    return NextResponse.json({ success: true, bonusCents: PHONE_OPTIN_BONUS_CENTS });
  } catch (error) {
    console.error('Phone opt-in error:', error);
    return NextResponse.json({ error: 'Failed to process phone opt-in' }, { status: 500 });
  }
}
