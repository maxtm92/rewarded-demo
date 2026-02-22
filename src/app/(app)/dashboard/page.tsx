import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PageTransition from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';
import WithdrawalTimeline from '@/components/dashboard/WithdrawalTimeline';
import TransactionFilter from '@/components/dashboard/TransactionFilter';
import BalanceHeroClient from '@/components/dashboard/BalanceHeroClient';
import StreakBanner from '@/components/earn/StreakBanner';

export const dynamic = 'force-dynamic';

function startOfWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  const [user, transactions, pendingWithdrawals, achievementCount, totalAchievements, referralCount, weeklyEarnings, todayEarnings] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { balanceCents: true, lifetimeCents: true, currentStreak: true, longestStreak: true, name: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.withdrawal.count({
      where: { userId, status: 'PENDING' },
    }),
    prisma.userAchievement.count({ where: { userId } }),
    prisma.achievement.count(),
    prisma.user.count({ where: { referredById: userId } }),
    prisma.transaction.aggregate({
      where: { userId, type: 'EARNING', createdAt: { gte: startOfWeek() } },
      _sum: { amountCents: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'EARNING', createdAt: { gte: startOfToday() } },
      _sum: { amountCents: true },
    }),
  ]);

  const weekCents = weeklyEarnings._sum.amountCents ?? 0;
  const todayCents = todayEarnings._sum.amountCents ?? 0;

  const quickActions = [
    { icon: '🎮', title: 'Earn Now', desc: 'Browse offers', href: '/earn', color: 'border-t-purple-500' },
    { icon: '🤝', title: 'Invite Friends', desc: 'Earn 10% forever', href: '/referral', color: 'border-t-[#01d676]' },
    { icon: '🏅', title: 'Leaderboard', desc: 'See your rank', href: '/leaderboard', color: 'border-t-[#fac401]' },
  ];

  // Serialize transactions for client component
  const serializedTx = transactions.map(tx => ({
    id: tx.id,
    type: tx.type,
    amountCents: tx.amountCents,
    balanceAfterCents: tx.balanceAfterCents,
    source: tx.source,
    description: tx.description,
    createdAt: tx.createdAt.toISOString(),
  }));

  return (
    <PageTransition>
      {/* 1. Balance Hero with animated numbers */}
      <BalanceHeroClient
        balanceCents={user.balanceCents}
        todayCents={todayCents}
        weekCents={weekCents}
        lifetimeCents={user.lifetimeCents}
        userName={user.name}
      />

      {/* 2. Streak Section */}
      <div className="mb-6">
        <StreakBanner />
      </div>

      {/* 3. Stats Strip — 4 cards */}
      <StaggerList className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StaggerItem>
          <div className="p-4 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">💰</span>
              <p className="text-[#787ead] text-xs">Today</p>
            </div>
            <p className="text-xl font-extrabold text-[#01d676]">{formatCurrency(todayCents)}</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="p-4 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">📊</span>
              <p className="text-[#787ead] text-xs">This Week</p>
            </div>
            <p className="text-xl font-extrabold text-[#01d676]">{formatCurrency(weekCents)}</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <Link href="/profile" className="block p-4 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset hover:border-[#fac401]/30 transition group">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🏆</span>
              <p className="text-[#787ead] text-xs">Badges</p>
            </div>
            <p className="text-xl font-extrabold text-white">{achievementCount}<span className="text-[#787ead] text-sm font-normal">/{totalAchievements}</span></p>
          </Link>
        </StaggerItem>
        <StaggerItem>
          <Link href="/referral" className="block p-4 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset hover:border-[#01d676]/30 transition group">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">👥</span>
              <p className="text-[#787ead] text-xs">Referrals</p>
            </div>
            <p className="text-xl font-extrabold text-white">{referralCount}</p>
          </Link>
        </StaggerItem>
      </StaggerList>

      {/* 4. Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {quickActions.map(a => (
          <Link
            key={a.href}
            href={a.href}
            className={`p-4 rounded-2xl bg-[#1d1d2e] border border-[#393e56] border-t-[3px] ${a.color} card-inset hover-lift text-center group`}
          >
            <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{a.icon}</span>
            <p className="text-white text-sm font-semibold">{a.title}</p>
            <p className="text-[#787ead] text-[11px]">{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* 5. Withdrawal Timeline */}
      <div className="mb-8">
        <WithdrawalTimeline />
      </div>

      {/* 6. Recent Activity */}
      <TransactionFilter transactions={serializedTx} />
    </PageTransition>
  );
}
