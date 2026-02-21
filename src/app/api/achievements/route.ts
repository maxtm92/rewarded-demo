import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [achievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: { achievementId: true, unlockedAt: true },
    }),
  ]);

  const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]));

  const result = achievements.map(a => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id)?.toISOString() ?? null,
  }));

  return NextResponse.json({
    achievements: result,
    unlockedCount: userAchievements.length,
    totalCount: achievements.length,
  });
}
