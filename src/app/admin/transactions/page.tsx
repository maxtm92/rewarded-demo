import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import PaginationControls from '@/components/admin/PaginationControls';

export const dynamic = 'force-dynamic';

const PER_PAGE = 25;

interface Props {
  searchParams: Promise<{ page?: string; search?: string; type?: string; status?: string; dateRange?: string }>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const { page: pageStr, search, type: txType, status: txStatus, dateRange } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10));

  // Build where clause
  const where: Record<string, unknown> = {};

  if (search) {
    where.user = {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  if (txType && txType !== 'ALL') {
    where.type = txType;
  }

  if (txStatus && txStatus !== 'ALL') {
    where.status = txStatus;
  }

  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    const start = new Date(now);
    if (dateRange === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (dateRange === '7d') {
      start.setDate(start.getDate() - 7);
    } else if (dateRange === '30d') {
      start.setDate(start.getDate() - 30);
    }
    where.createdAt = { gte: start };
  }

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const types = ['ALL', 'EARNING', 'WITHDRAWAL', 'BONUS', 'ADJUSTMENT'];
  const statuses = ['ALL', 'COMPLETED', 'PENDING'];
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
  ];

  // Build export URL with current filters
  const exportParams = new URLSearchParams({ type: 'transactions' });
  if (dateRange) exportParams.set('dateRange', dateRange);
  if (txType && txType !== 'ALL') exportParams.set('txType', txType);
  if (txStatus && txStatus !== 'ALL') exportParams.set('txStatus', txStatus);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (txType) params.set('type', txType);
    if (txStatus) params.set('status', txStatus);
    if (dateRange) params.set('dateRange', dateRange);
    for (const [k, v] of Object.entries(overrides)) {
      params.set(k, v);
    }
    // Reset page when changing filters
    if (!overrides.page) params.delete('page');
    return `/admin/transactions?${params.toString()}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transactions ({totalCount.toLocaleString()})</h1>
        <a
          href={`/api/admin/export?${exportParams.toString()}`}
          className="px-4 py-2 rounded-lg bg-[#2f3043] text-gray-300 hover:bg-[#42435a] text-xs font-medium transition"
        >
          Export CSV
        </a>
      </div>

      {/* Search */}
      <form action="/admin/transactions" method="GET" className="mb-4">
        {txType && <input type="hidden" name="type" value={txType} />}
        {txStatus && <input type="hidden" name="status" value={txStatus} />}
        {dateRange && <input type="hidden" name="dateRange" value={dateRange} />}
        <input
          type="text"
          name="search"
          defaultValue={search || ''}
          placeholder="Search by user email or name..."
          className="w-full max-w-md px-4 py-2.5 rounded-lg bg-[#2f3043] border border-[#393e56] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Type Filter */}
        <div className="flex gap-1">
          <span className="text-xs text-gray-500 self-center mr-1">Type:</span>
          {types.map((t) => (
            <a
              key={t}
              href={buildUrl({ type: t })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                (txType || 'ALL') === t
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'bg-[#2f3043] text-gray-400 hover:bg-[#42435a]'
              }`}
            >
              {t}
            </a>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-1">
          <span className="text-xs text-gray-500 self-center mr-1">Status:</span>
          {statuses.map((s) => (
            <a
              key={s}
              href={buildUrl({ status: s })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                (txStatus || 'ALL') === s
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'bg-[#2f3043] text-gray-400 hover:bg-[#42435a]'
              }`}
            >
              {s}
            </a>
          ))}
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-1">
          <span className="text-xs text-gray-500 self-center mr-1">Period:</span>
          {dateRanges.map((d) => (
            <a
              key={d.value}
              href={buildUrl({ dateRange: d.value })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                (dateRange || 'all') === d.value
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'bg-[#2f3043] text-gray-400 hover:bg-[#42435a]'
              }`}
            >
              {d.label}
            </a>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#151929] border border-white/5 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-3 text-gray-400 font-medium">User</th>
              <th className="text-left p-3 text-gray-400 font-medium">Type</th>
              <th className="text-left p-3 text-gray-400 font-medium">Source</th>
              <th className="text-left p-3 text-gray-400 font-medium">Description</th>
              <th className="text-right p-3 text-gray-400 font-medium">Amount</th>
              <th className="text-center p-3 text-gray-400 font-medium">Status</th>
              <th className="text-left p-3 text-gray-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-white/5 last:border-0">
                <td className="p-3">
                  <p className="font-medium text-xs">{tx.user.name || tx.user.email || '—'}</p>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    tx.type === 'EARNING' ? 'bg-emerald-500/10 text-emerald-400' :
                    tx.type === 'BONUS' ? 'bg-amber-500/10 text-amber-400' :
                    tx.type === 'ADJUSTMENT' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{tx.type}</span>
                </td>
                <td className="p-3 text-gray-400 text-xs">{tx.source}</td>
                <td className="p-3 text-gray-400 text-xs max-w-[200px] truncate">{tx.description}</td>
                <td className="p-3 text-right font-medium">{formatCurrency(tx.amountCents)}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                    tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{tx.status}</span>
                </td>
                <td className="p-3 text-gray-400 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No transactions found{search ? ` matching "${search}"` : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls currentPage={page} totalPages={totalPages} totalItems={totalCount} />
    </div>
  );
}
