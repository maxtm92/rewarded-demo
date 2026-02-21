import { prisma } from '@/lib/prisma';

type TxClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>;

export async function checkAndAwardAchievements(
  tx: TxClient,
  userId: string
): Promise<string[]> {
  const [user, achievements, existing, postbackCount, withdrawalCount, referralCount] = await Promise.all([
    tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { lifetimeCents: true, currentStreak: true, longestStreak: true, onboardingDone: true },
    }),
    tx.achievement.findMany(),
    tx.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    tx.postback.count({ where: { userId, status: 'CREDITED' } }),
    tx.withdrawal.count({ where: { userId } }),
    tx.user.count({ where: { referredById: userId } }),
  ]);

  const existingIds = new Set(existing.map(e => e.achievementId));
  const newlyUnlocked: string[] = [];

  for (const achievement of achievements) {
    if (existingIds.has(achievement.id)) continue;

    let earned = false;

    switch (achievement.category) {
      case 'earning':
        earned = user.lifetimeCents >= achievement.threshold;
        break;
      case 'withdrawal':
        earned = withdrawalCount >= achievement.threshold;
        break;
      case 'streak':
        earned = Math.max(user.currentStreak, user.longestStreak) >= achievement.threshold;
        break;
      case 'referral':
        earned = referralCount >= achievement.threshold;
        break;
      case 'milestone':
        if (achievement.slug === 'survey-complete') {
          earned = user.onboardingDone;
        } else if (achievement.slug === 'offers-10') {
          earned = postbackCount >= achievement.threshold;
        }
        break;
    }

    if (earned) {
      await tx.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
      newlyUnlocked.push(achievement.slug);
    }
  }

  return newlyUnlocked;
}
