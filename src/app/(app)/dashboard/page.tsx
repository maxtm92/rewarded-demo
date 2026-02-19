import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-600/20 to-emerald-700/5 border border-emerald-500/20">
          <p className="text-gray-400 text-sm mb-1">Available Balance</p>
          <p className="text-3xl font-extrabold text-emerald-400 text-glow-green">
            {formatCurrency(user.balanceCents)}
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-[#151929] border border-white/5">
          <p className="text-gray-400 text-sm mb-1">Total Earned</p>
          <p className="text-3xl font-extrabold">{formatCurrency(user.lifetimeCents)}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#151929] border border-white/5">
          <p className="text-gray-400 text-sm mb-1">Pending Withdrawals</p>
          <p className="text-3xl font-extrabold">{pendingWithdrawals}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href="/withdraw"
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition"
        >
          Cash Out
        </Link>
        <Link
          href="/earn"
          className="px-6 py-3 rounded-xl bg-[#151929] border border-white/10 hover:border-white/20 font-semibold transition"
        >
          Earn More
        </Link>
      </div>

      {/* Transaction History */}
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-[#151929] border border-white/5">
          <span className="text-4xl mb-3 block">📭</span>
          <p className="text-gray-400">No transactions yet. Start earning to see your activity!</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#151929] border border-white/5 overflow-hidden">
          {transactions.map((tx) => {
            const isPositive = tx.type !== 'WITHDRAWAL';
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg">
                    {tx.type === 'EARNING' ? '💰' : tx.type === 'BONUS' ? '🎁' : '💸'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.description || tx.source}</p>
                    <p className="text-gray-500 text-xs">
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
                  <p className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : '-'}{formatCurrency(Math.abs(tx.amountCents))}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Bal: {formatCurrency(tx.balanceAfterCents)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
