import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import PaginationControls from '@/components/admin/PaginationControls';

export const dynamic = 'force-dynamic';

const PER_PAGE = 25;

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function UsersPage({ searchParams }: Props) {
  const { page: pageStr, search } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10));

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }
    : {};

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        surveyResponse: { select: { ageRange: true, country: true } },
        utmCaptures: { select: { source: true }, take: 1 },
        _count: { select: { transactions: true, postbacks: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users ({totalCount})</h1>
        <a
          href="/api/admin/export?type=users"
          className="px-4 py-2 rounded-lg bg-[#2f3043] text-sm text-gray-300 hover:bg-[#42435a] transition"
        >
          Export CSV
        </a>
      </div>

      {/* Search */}
      <form className="mb-4">
        <input
          name="search"
          defaultValue={search || ''}
          placeholder="Search by name, email, or phone..."
          className="w-full max-w-md px-4 py-2.5 rounded-lg bg-[#151929] border border-white/5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
      </form>

      <div className="rounded-xl bg-[#151929] border border-white/5 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-3 text-gray-400 font-medium">User</th>
              <th className="text-left p-3 text-gray-400 font-medium">Source</th>
              <th className="text-left p-3 text-gray-400 font-medium">Survey</th>
              <th className="text-right p-3 text-gray-400 font-medium">Balance</th>
              <th className="text-right p-3 text-gray-400 font-medium">Lifetime</th>
              <th className="text-center p-3 text-gray-400 font-medium">Txns</th>
              <th className="text-center p-3 text-gray-400 font-medium">Status</th>
              <th className="text-left p-3 text-gray-400 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                <td className="p-3">
                  <Link href={`/admin/users/${user.id}`} className="hover:text-emerald-400 transition">
                    <p className="font-medium">{user.name || 'No name'}</p>
                    <p className="text-gray-500 text-xs">{user.email || user.phone || user.id.slice(0, 12)}</p>
                  </Link>
                </td>
                <td className="p-3 text-gray-400 text-xs">
                  {user.utmCaptures[0]?.source || '—'}
                </td>
                <td className="p-3">
                  {user.onboardingDone ? (
                    <span className="text-emerald-400 text-xs">Done</span>
                  ) : (
                    <span className="text-gray-500 text-xs">Pending</span>
                  )}
                </td>
                <td className="p-3 text-right font-medium text-emerald-400">
                  {formatCurrency(user.balanceCents)}
                </td>
                <td className="p-3 text-right">{formatCurrency(user.lifetimeCents)}</td>
                <td className="p-3 text-center">{user._count.transactions}</td>
                <td className="p-3 text-center">
                  {user.isBanned ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400">Banned</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400">Active</span>
                  )}
                </td>
                <td className="p-3 text-gray-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls currentPage={page} totalPages={totalPages} totalItems={totalCount} />
    </div>
  );
}
