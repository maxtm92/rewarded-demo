import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import PaginationControls from '@/components/admin/PaginationControls';

export const dynamic = 'force-dynamic';

const PER_PAGE = 25;

interface Props {
  searchParams: Promise<{ page?: string; search?: string; wall?: string; status?: string; dateRange?: string }>;
}

export default async function PostbacksPage({ searchParams }: Props) {
  const { page: pageStr, search, wall: wallFilter, status: statusFilter, dateRange } = await searchParams;
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

  if (wallFilter && wallFilter !== 'ALL') {
    where.offerWallId = wallFilter;
  }

  if (statusFilter && statusFilter !== 'ALL') {
    where.status = statusFilter;
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

  const [postbacks, totalCount, walls] = await Promise.all([
    prisma.postback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        user: { select: { email: true, name: true, id: true } },
        offerWall: { select: { name: true, slug: true } },
      },
    }),
    prisma.postback.count({ where }),
    prisma.offerWall.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const statuses = ['ALL', 'CREDITED', 'REVERSED', 'REJECTED'];
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
  ];

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (wallFilter) params.set('wall', wallFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (dateRange) params.set('dateRange', dateRange);
    for (const [k, v] of Object.entries(overrides)) {
      params.set(k, v);
    }
    if (!overrides.page) params.delete('page');
    return `/admin/postbacks?${params.toString()}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Postbacks ({totalCount.toLocaleString()})</h1>

      {/* Search */}
      <form action="/admin/postbacks" method="GET" className="mb-4">
        {wallFilter && <input type="hidden" name="wall" value={wallFilter} />}
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        {dateRange && <input type="hidden" name="dateRange" value={dateRange} />}
        <input
          type="text"
          name="search"
          defaultValue={search || ''}
          placeholder="Search by user email or name..."
          className="w-full max-w-md px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Wall Filter */}
        <div className="flex gap-1 items-center">
          <span className="text-xs text-gray-500 mr-1">Wall:</span>
          <a
            href={buildUrl({ wall: 'ALL' })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              !wallFilter || wallFilter === 'ALL'
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            ALL
          </a>
          {walls.map((w) => (
            <a
              key={w.id}
              href={buildUrl({ wall: w.id })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                wallFilter === w.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {w.name}
            </a>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 items-center">
          <span className="text-xs text-gray-500 mr-1">Status:</span>
          {statuses.map((s) => (
            <a
              key={s}
              href={buildUrl({ status: s })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                (statusFilter || 'ALL') === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </a>
          ))}
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-1 items-center">
          <span className="text-xs text-gray-500 mr-1">Period:</span>
          {dateRanges.map((d) => (
            <a
              key={d.value}
              href={buildUrl({ dateRange: d.value })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                (dateRange || 'all') === d.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {d.label}
            </a>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">User</th>
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Wall</th>
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Offer</th>
              <th className="text-right p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Payout</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">External ID</th>
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {postbacks.map((pb) => (
              <tr key={pb.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="p-3">
                  <Link href={`/admin/users/${pb.user.id}`} className="hover:text-blue-600 transition">
                    <p className="font-medium text-xs text-gray-900">{pb.user.name || pb.user.email || '—'}</p>
                  </Link>
                </td>
                <td className="p-3 text-gray-500 text-xs">{pb.offerWall.name}</td>
                <td className="p-3 text-gray-500 text-xs max-w-[200px] truncate">{pb.offerName || pb.offerId || '—'}</td>
                <td className="p-3 text-right font-medium text-gray-900">{formatCurrency(pb.payoutCents)}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    pb.status === 'CREDITED' ? 'bg-emerald-50 text-emerald-700' :
                    pb.status === 'REVERSED' ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>{pb.status}</span>
                </td>
                <td className="p-3 text-gray-400 text-xs font-mono max-w-[120px] truncate">{pb.externalId || '—'}</td>
                <td className="p-3 text-gray-500 text-xs">{new Date(pb.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {postbacks.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No postbacks found{search ? ` matching "${search}"` : ''}
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
