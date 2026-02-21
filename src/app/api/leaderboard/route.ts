import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentPeriods } from '@/lib/leaderboard';

export async function GET(request: NextRequest) {
  const session = await auth();
  const periodType = request.nextUrl.searchParams.get('period') || 'weekly';
  const periods = getCurrentPeriods();
  const period = periodType === 'monthly' ? periods.monthly : periods.weekly;

  const entries = await prisma.leaderboardEntry.findMany({
    where: { period },
    orderBy: { earnedCents: 'desc' },
    take: 25,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const leaderboard = entries.map((entry, index) => {
    const name = entry.user.name
      ? `${entry.user.name.split(' ')[0]} ${(entry.user.name.split(' ')[1] || '')[0] || ''}.`.trim()
      : `User ${entry.user.id.slice(-4)}`;

    return {
      rank: index + 1,
      name,
      earnedCents: entry.earnedCents,
      isCurrentUser: session?.user?.id === entry.userId,
    };
  });

  // Find current user's rank if not in top 25
  let currentUserRank = null;
  if (session?.user?.id) {
    const userEntry = await prisma.leaderboardEntry.findUnique({
      where: { userId_period: { userId: session.user.id, period } },
    });

    if (userEntry) {
      const higherCount = await prisma.leaderboardEntry.count({
        where: { period, earnedCents: { gt: userEntry.earnedCents } },
      });
      currentUserRank = {
        rank: higherCount + 1,
        earnedCents: userEntry.earnedCents,
      };
    }
  }

  return NextResponse.json({ leaderboard, currentUserRank, period: periodType });
}
