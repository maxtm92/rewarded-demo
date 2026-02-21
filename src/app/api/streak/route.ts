import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isConsecutiveDay, getMultiplier, getDailyBonus } from '@/lib/streak';
import { checkAndAwardAchievements } from '@/lib/achievements';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { currentStreak: true, lastLoginDate: true },
  });

  const now = new Date();
  const status = isConsecutiveDay(user.lastLoginDate, now);
  const claimedToday = status === 'same_day';
  const streak = claimedToday ? user.currentStreak : (status === 'consecutive' ? user.currentStreak + 1 : 1);

  return NextResponse.json({
    currentStreak: user.currentStreak,
    multiplier: getMultiplier(user.currentStreak),
    claimedToday,
    nextBonusCents: claimedToday ? 0 : getDailyBonus(streak),
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { currentStreak: true, longestStreak: true, lastLoginDate: true, balanceCents: true },
      });

      const now = new Date();
      const status = isConsecutiveDay(user.lastLoginDate, now);

      if (status === 'same_day') {
        return { alreadyClaimed: true, currentStreak: user.currentStreak };
      }

      const newStreak = status === 'consecutive' ? user.currentStreak + 1 : 1;
      const bonusCents = getDailyBonus(newStreak);
      const newBalance = user.balanceCents + bonusCents;
      const newLongest = Math.max(user.longestStreak, newStreak);

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastLoginDate: now,
          balanceCents: { increment: bonusCents },
          lifetimeCents: { increment: bonusCents },
        },
      });

      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'BONUS',
          amountCents: bonusCents,
          balanceAfterCents: newBalance,
          source: 'daily_streak',
          description: `Day ${newStreak} streak bonus`,
          status: 'COMPLETED',
        },
      });

      const newAchievements = await checkAndAwardAchievements(tx, session.user.id);

      return {
        alreadyClaimed: false,
        currentStreak: newStreak,
        bonusCents,
        multiplier: getMultiplier(newStreak),
        newAchievements,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to claim streak';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
