import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PageTransition from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';
import WithdrawalTimeline from '@/components/dashboard/WithdrawalTimeline';
import TransactionFilter from '@/components/dashboard/TransactionFilter';

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
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Balance Hero Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-[#01d676]/20 via-[#0a2e1f] to-[#1d1d2e] border border-[#01d676]/20 relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#01d676]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#01d676]/5 rounded-full blur-2xl" />

        {/* Today's earnings badge */}
        {todayCents > 0 && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#01d676]/15 border border-[#01d676]/30 text-[#01d676] text-xs font-semibold">
            Today: +{formatCurrency(todayCents)}
          </div>
        )}

        <p className="text-[#01d676]/70 text-sm font-medium mb-1 relative">Available Balance</p>
        <p className="text-5xl font-extrabold text-white relative mb-5">
          {formatCurrency(user.balanceCents)}
        </p>
        <div className="flex gap-3 relative">
          <Link
            href="/withdraw"
            className="px-6 py-3 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-semibold text-sm transition glow-green-cta btn-hover"
          >
            Cash Out
          </Link>
          <Link
            href="/earn"
            className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm hover:bg-white/15 transition btn-hover"
          >
            Earn More
          </Link>
        </div>
      </div>

      {/* Quick Stats Strip — 4 cards */}
      <StaggerList className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StaggerItem>
          <Link href="/earn" className="block p-4 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset hover:border-[#01d676]/30 transition group">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🔥</span>
              <p className="text-[#787ead] text-xs">Streak</p>
            </div>
            <p className="text-xl font-extrabold text-white">
              {user.currentStreak > 0 ? `${user.currentStreak} Day${user.currentStreak > 1 ? 's' : ''}` : '—'}
            </p>
            {user.currentStreak === 0 && <p className="text-[#787ead] text-[10px]">Start a streak!</p>}
          </Link>
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

      {/* Quick Actions */}
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

      {/* Withdrawal Timeline */}
      <div className="mb-8">
        <WithdrawalTimeline />
      </div>

      {/* Recent Activity — client component with filters */}
      <TransactionFilter transactions={serializedTx} />
    </PageTransition>
  );
}
