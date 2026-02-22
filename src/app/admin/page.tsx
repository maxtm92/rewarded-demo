import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function getPeriodDates(period: string) {
  const now = new Date();
  if (period === 'all') return { start: null, prevStart: null, prevEnd: null };

  const days = period === 'today' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  if (period === 'today') start.setHours(0, 0, 0, 0);

  const prevEnd = new Date(start);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - days);
  if (period === 'today') {
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setHours(0, 0, 0, 0);
  }

  return { start, prevStart, prevEnd };
}

function computeTrend(current: number, previous: number) {
  if (previous === 0) return { pct: current > 0 ? '+100' : '0', direction: current > 0 ? 'up' as const : 'flat' as const };
  const pct = ((current - previous) / previous * 100).toFixed(1);
  return {
    pct: Number(pct) >= 0 ? `+${pct}` : pct,
    direction: Number(pct) > 0 ? 'up' as const : Number(pct) < 0 ? 'down' as const : 'flat' as const,
  };
}

interface Props {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminDashboard({ searchParams }: Props) {
  const { period: periodParam } = await searchParams;
  const period = periodParam || '30d';
  const { start, prevStart, prevEnd } = getPeriodDates(period);

  const dateWhere = start ? { createdAt: { gte: start } } : {};
  const prevDateWhere = prevStart && prevEnd ? { createdAt: { gte: prevStart, lt: prevEnd } } : {};

  const [
    totalUsers, prevUsers,
    totalRevenue, prevRevenue,
    totalPayouts, prevPayouts,
    totalPostbacks, prevPostbacks,
    pendingWithdrawals,
    todaySignups,
    recentTransactions,
  ] = await Promise.all([
    prisma.user.count({ where: dateWhere }),
    prevStart ? prisma.user.count({ where: prevDateWhere }) : Promise.resolve(0),
    prisma.postback.aggregate({ _sum: { payoutCents: true }, where: { status: 'CREDITED', ...dateWhere } }),
    prevStart ? prisma.postback.aggregate({ _sum: { payoutCents: true }, where: { status: 'CREDITED', ...prevDateWhere } }) : Promise.resolve({ _sum: { payoutCents: null } }),
    prisma.withdrawal.aggregate({ _sum: { amountCents: true }, where: { status: 'COMPLETED', ...dateWhere } }),
    prevStart ? prisma.withdrawal.aggregate({ _sum: { amountCents: true }, where: { status: 'COMPLETED', ...prevDateWhere } }) : Promise.resolve({ _sum: { amountCents: null } }),
    prisma.postback.count({ where: { status: 'CREDITED', ...dateWhere } }),
    prevStart ? prisma.postback.count({ where: { status: 'CREDITED', ...prevDateWhere } }) : Promise.resolve(0),
    prisma.withdrawal.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.transaction.findMany({
      where: dateWhere,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  const revenue = totalRevenue._sum.payoutCents || 0;
  const prevRevenueVal = prevRevenue._sum.payoutCents || 0;
  const payouts = totalPayouts._sum.amountCents || 0;
  const prevPayoutsVal = prevPayouts._sum.amountCents || 0;
  const netProfit = revenue - payouts;
  const prevNetProfit = prevRevenueVal - prevPayoutsVal;
  const showTrend = period !== 'all';

  const kpis = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: '👥', trend: showTrend ? computeTrend(totalUsers, prevUsers) : null },
    { label: 'Today Signups', value: todaySignups.toLocaleString(), icon: '📈', trend: null },
    { label: 'Total Revenue', value: formatCurrency(revenue), icon: '💰', color: 'text-emerald-600', trend: showTrend ? computeTrend(revenue, prevRevenueVal) : null },
    { label: 'Total Payouts', value: formatCurrency(payouts), icon: '💸', color: 'text-red-600', trend: showTrend ? computeTrend(payouts, prevPayoutsVal) : null },
    { label: 'Net Profit', value: formatCurrency(netProfit), icon: '📊', color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', trend: showTrend ? computeTrend(netProfit, prevNetProfit) : null },
    { label: 'Postbacks', value: totalPostbacks.toLocaleString(), icon: '🔔', trend: showTrend ? computeTrend(totalPostbacks, prevPostbacks) : null },
    { label: 'Pending Withdrawals', value: pendingWithdrawals.toLocaleString(), icon: '⏳', color: pendingWithdrawals > 0 ? 'text-amber-600' : '', trend: null },
  ];

  const periods = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {periods.map((p) => (
          <a
            key={p.value}
            href={`/admin?period=${p.value}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              period === p.value
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </a>
        ))}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{kpi.icon}</span>
              <span className="text-gray-500 text-xs">{kpi.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-bold ${kpi.color || 'text-gray-900'}`}>{kpi.value}</p>
              {kpi.trend && kpi.trend.direction !== 'flat' && (
                <span className={`text-xs font-medium ${kpi.trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {kpi.trend.direction === 'up' ? '↑' : '↓'} {kpi.trend.pct}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
      <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">User</th>
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Type</th>
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Source</th>
              <th className="text-right p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Amount</th>
              <th className="text-right p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="p-3 text-gray-900">{tx.user.name || tx.user.email || tx.userId.slice(0, 8)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    tx.type === 'EARNING' ? 'bg-emerald-50 text-emerald-700' :
                    tx.type === 'BONUS' ? 'bg-amber-50 text-amber-700' :
                    tx.type === 'ADJUSTMENT' ? 'bg-blue-50 text-blue-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{tx.source}</td>
                <td className="p-3 text-right font-medium text-gray-900">{formatCurrency(tx.amountCents)}</td>
                <td className="p-3 text-right text-gray-500">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {recentTransactions.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No transactions in this period</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
