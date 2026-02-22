import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import UserAdminActions from '@/components/admin/UserAdminActions';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      surveyResponse: true,
      utmCaptures: true,
      transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
      postbacks: { orderBy: { createdAt: 'desc' }, take: 20, include: { offerWall: { select: { name: true } } } },
      withdrawals: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });

  if (!user) return notFound();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Detail</h1>

      {/* User Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs mb-1">Email</p>
          <p className="text-sm font-medium text-gray-900">{user.email || '—'}</p>
        </div>
        <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs mb-1">Phone</p>
          <p className="text-sm font-medium text-gray-900">{user.phone || '—'}</p>
        </div>
        <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs mb-1">Balance</p>
          <p className="text-sm font-medium text-emerald-600">{formatCurrency(user.balanceCents)}</p>
        </div>
        <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs mb-1">Lifetime</p>
          <p className="text-sm font-medium text-gray-900">{formatCurrency(user.lifetimeCents)}</p>
        </div>
      </div>

      {/* UTM Data */}
      {user.utmCaptures.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">UTM Attribution</h2>
          <div className="p-4 rounded-lg bg-white border border-gray-200 grid grid-cols-3 gap-3 text-sm">
            {user.utmCaptures.map((utm) => (
              <div key={utm.id}>
                <p className="text-gray-500 text-xs">Source: {utm.source || '—'}</p>
                <p className="text-gray-500 text-xs">Medium: {utm.medium || '—'}</p>
                <p className="text-gray-500 text-xs">Campaign: {utm.campaign || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Survey */}
      {user.surveyResponse && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Survey Answers</h2>
          <div className="p-4 rounded-lg bg-white border border-gray-200 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Age:</span> <span className="text-gray-900">{user.surveyResponse.ageRange || '—'}</span></div>
            <div><span className="text-gray-500">Gender:</span> <span className="text-gray-900">{user.surveyResponse.gender || '—'}</span></div>
            <div><span className="text-gray-500">Income:</span> <span className="text-gray-900">{user.surveyResponse.income || '—'}</span></div>
            <div><span className="text-gray-500">Country:</span> <span className="text-gray-900">{user.surveyResponse.country || '—'}</span></div>
            <div className="col-span-2"><span className="text-gray-500">Interests:</span> <span className="text-gray-900">{user.surveyResponse.interests.join(', ') || '—'}</span></div>
          </div>
        </div>
      )}

      {/* Postbacks */}
      {user.postbacks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Postbacks ({user.postbacks.length})</h2>
          <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Wall</th>
                  <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Offer</th>
                  <th className="text-right p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Payout</th>
                  <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {user.postbacks.map((pb) => (
                  <tr key={pb.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="p-3 text-gray-900">{pb.offerWall.name}</td>
                    <td className="p-3 text-gray-500">{pb.offerName || pb.offerId || '—'}</td>
                    <td className="p-3 text-right font-medium text-gray-900">{formatCurrency(pb.payoutCents)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        pb.status === 'CREDITED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>{pb.status}</span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{new Date(pb.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="mb-8">
        <UserAdminActions
          userId={user.id}
          isBanned={user.isBanned}
          currentBalanceCents={user.balanceCents}
        />
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Transactions ({user.transactions.length})</h2>
        <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Type</th>
                <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Description</th>
                <th className="text-right p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Amount</th>
                <th className="text-right p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Balance</th>
                <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {user.transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tx.type === 'EARNING' ? 'bg-emerald-50 text-emerald-700' :
                      tx.type === 'BONUS' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>{tx.type}</span>
                  </td>
                  <td className="p-3 text-gray-500">{tx.description || tx.source}</td>
                  <td className="p-3 text-right font-medium text-gray-900">{formatCurrency(tx.amountCents)}</td>
                  <td className="p-3 text-right text-gray-500">{formatCurrency(tx.balanceAfterCents)}</td>
                  <td className="p-3 text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
