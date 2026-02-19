import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      surveyResponse: { select: { ageRange: true, country: true } },
      utmCaptures: { select: { source: true }, take: 1 },
      _count: { select: { transactions: true, postbacks: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>

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
                <td className="p-3 text-gray-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
