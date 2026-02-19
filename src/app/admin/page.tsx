import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [
    totalUsers,
    totalRevenue,
    totalPayouts,
    totalPostbacks,
    pendingWithdrawals,
    todaySignups,
    recentTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.postback.aggregate({ _sum: { payoutCents: true }, where: { status: 'CREDITED' } }),
    prisma.withdrawal.aggregate({ _sum: { amountCents: true }, where: { status: 'COMPLETED' } }),
    prisma.postback.count({ where: { status: 'CREDITED' } }),
    prisma.withdrawal.count({ where: { status: 'PENDING' } }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  const revenue = totalRevenue._sum.payoutCents || 0;
  const payouts = totalPayouts._sum.amountCents || 0;
  const netProfit = revenue - payouts;

  const kpis = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: '👥' },
    { label: 'Today Signups', value: todaySignups.toLocaleString(), icon: '📈' },
    { label: 'Total Revenue', value: formatCurrency(revenue), icon: '💰', color: 'text-emerald-400' },
    { label: 'Total Payouts', value: formatCurrency(payouts), icon: '💸', color: 'text-red-400' },
    { label: 'Net Profit', value: formatCurrency(netProfit), icon: '📊', color: netProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Postbacks', value: totalPostbacks.toLocaleString(), icon: '🔔' },
    { label: 'Pending Withdrawals', value: pendingWithdrawals.toLocaleString(), icon: '⏳', color: pendingWithdrawals > 0 ? 'text-amber-400' : '' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="p-4 rounded-xl bg-[#151929] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <span>{kpi.icon}</span>
              <span className="text-gray-400 text-xs">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color || ''}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
      <div className="rounded-xl bg-[#151929] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-3 text-gray-400 font-medium">User</th>
              <th className="text-left p-3 text-gray-400 font-medium">Type</th>
              <th className="text-left p-3 text-gray-400 font-medium">Source</th>
              <th className="text-right p-3 text-gray-400 font-medium">Amount</th>
              <th className="text-right p-3 text-gray-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-white/5 last:border-0">
                <td className="p-3">{tx.user.name || tx.user.email || tx.userId.slice(0, 8)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    tx.type === 'EARNING' ? 'bg-emerald-500/10 text-emerald-400' :
                    tx.type === 'BONUS' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="p-3 text-gray-400">{tx.source}</td>
                <td className="p-3 text-right font-medium">{formatCurrency(tx.amountCents)}</td>
                <td className="p-3 text-right text-gray-400">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
