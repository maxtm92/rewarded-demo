import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PageTransition from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [user, transactions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { balanceCents: true, lifetimeCents: true, profileComplete: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const pendingWithdrawals = await prisma.withdrawal.count({
    where: { userId: session.user.id, status: 'PENDING' },
  });

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Hero Balance Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-[#01d676]/20 via-[#0a2e1f] to-[#1d1d2e] border border-[#01d676]/20 relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#01d676]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#01d676]/5 rounded-full blur-2xl" />

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

      {/* Stat Cards */}
      <StaggerList className="grid grid-cols-2 gap-4 mb-8">
        <StaggerItem>
          <div className="p-6 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset">
            <p className="text-[#787ead] text-sm mb-1">Total Earned</p>
            <p className="text-3xl font-extrabold text-white">{formatCurrency(user.lifetimeCents)}</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="p-6 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset">
            <p className="text-[#787ead] text-sm mb-1">Pending Withdrawals</p>
            <p className="text-3xl font-extrabold text-white">{pendingWithdrawals}</p>
          </div>
        </StaggerItem>
      </StaggerList>

      {/* Transaction History */}
      <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-shadow">
          <span className="text-4xl mb-3 block">📭</span>
          <p className="text-[#a9a9ca]">No transactions yet. Start earning to see your activity!</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#1d1d2e] border border-[#393e56] overflow-hidden card-shadow">
          {transactions.map((tx) => {
            const isPositive = tx.type !== 'WITHDRAWAL';
            const dotColor =
              tx.type === 'EARNING'
                ? 'bg-[#01d676]'
                : tx.type === 'BONUS'
                  ? 'bg-[#fac401]'
                  : 'bg-[#ff4757]';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border-b border-[#393e56]/50 last:border-0 row-hover"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${dotColor}`} />
                  <div>
                    <p className="font-medium text-sm text-white">{tx.description || tx.source}</p>
                    <p className="text-[#787ead] text-xs">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${isPositive ? 'text-[#01d676]' : 'text-[#ff4757]'}`}>
                    {isPositive ? '+' : '-'}{formatCurrency(Math.abs(tx.amountCents))}
                  </p>
                  <p className="text-[#787ead] text-xs">
                    Bal: {formatCurrency(tx.balanceAfterCents)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
