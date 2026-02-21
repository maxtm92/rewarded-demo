import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import WithdrawalActions from '@/components/admin/WithdrawalActions';
import PaginationControls from '@/components/admin/PaginationControls';

export const dynamic = 'force-dynamic';

const PER_PAGE = 25;

interface Props {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

export default async function WithdrawalsPage({ searchParams }: Props) {
  const { page: pageStr, status: statusFilter, search } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10));

  const where: Record<string, unknown> = {};

  if (statusFilter && statusFilter !== 'ALL') {
    where.status = statusFilter;
  }

  if (search) {
    where.user = {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [withdrawals, totalCount] = await Promise.all([
    prisma.withdrawal.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: { select: { email: true, name: true, phone: true } } },
    }),
    prisma.withdrawal.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const statuses = ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'];

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);
    for (const [k, v] of Object.entries(overrides)) {
      params.set(k, v);
    }
    if (!overrides.page) params.delete('page');
    return `/admin/withdrawals?${params.toString()}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Withdrawals ({totalCount})</h1>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4">
        {statuses.map((s) => {
          const isActive = (statusFilter || 'ALL') === s;
          return (
            <a
              key={s}
              href={buildUrl({ status: s })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'bg-[#2f3043] text-gray-400 hover:bg-[#42435a]'
              }`}
            >
              {s}
            </a>
          );
        })}
      </div>

      {/* Search */}
      <form action="/admin/withdrawals" method="GET" className="mb-4">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <input
          type="text"
          name="search"
          defaultValue={search || ''}
          placeholder="Search by email, name, or phone..."
          className="w-full max-w-md px-4 py-2.5 rounded-lg bg-[#2f3043] border border-[#393e56] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
      </form>

      <div className="rounded-xl bg-[#151929] border border-white/5 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-3 text-gray-400 font-medium">User</th>
              <th className="text-left p-3 text-gray-400 font-medium">Method</th>
              <th className="text-left p-3 text-gray-400 font-medium">Destination</th>
              <th className="text-right p-3 text-gray-400 font-medium">Amount</th>
              <th className="text-center p-3 text-gray-400 font-medium">Status</th>
              <th className="text-left p-3 text-gray-400 font-medium">Date</th>
              <th className="text-center p-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-b border-white/5 last:border-0">
                <td className="p-3">
                  <p className="font-medium text-xs">{w.user.name || w.user.email || w.user.phone || '—'}</p>
                </td>
                <td className="p-3 text-gray-400">{w.method}</td>
                <td className="p-3 text-gray-400 text-xs max-w-[200px] truncate">{w.destination || '—'}</td>
                <td className="p-3 text-right font-medium">{formatCurrency(w.amountCents)}</td>
                <td className="p-3 text-center">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                      w.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                      w.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{w.status}</span>
                    {w.status === 'REJECTED' && w.rejectionReason && (
                      <p
                        className="text-red-400/70 text-[10px] mt-1 max-w-[150px] truncate"
                        title={w.rejectionReason}
                      >
                        {w.rejectionReason}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-3 text-gray-400 text-xs">{new Date(w.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-center">
                  {(w.status === 'PENDING' || w.status === 'PROCESSING') && (
                    <WithdrawalActions id={w.id} amountCents={w.amountCents} method={w.method} />
                  )}
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No withdrawals found{search ? ` matching "${search}"` : ''}
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
