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
      <h1 className="text-2xl font-bold mb-6">User Detail</h1>

      {/* User Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-[#151929] border border-white/5">
          <p className="text-gray-400 text-xs mb-1">Email</p>
          <p className="text-sm font-medium">{user.email || '—'}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#151929] border border-white/5">
          <p className="text-gray-400 text-xs mb-1">Phone</p>
          <p className="text-sm font-medium">{user.phone || '—'}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#151929] border border-white/5">
          <p className="text-gray-400 text-xs mb-1">Balance</p>
          <p className="text-sm font-medium text-emerald-400">{formatCurrency(user.balanceCents)}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#151929] border border-white/5">
          <p className="text-gray-400 text-xs mb-1">Lifetime</p>
          <p className="text-sm font-medium">{formatCurrency(user.lifetimeCents)}</p>
        </div>
      </div>

      {/* UTM Data */}
      {user.utmCaptures.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">UTM Attribution</h2>
          <div className="p-4 rounded-xl bg-[#151929] border border-white/5 grid grid-cols-3 gap-3 text-sm">
            {user.utmCaptures.map((utm) => (
              <div key={utm.id}>
                <p className="text-gray-400 text-xs">Source: {utm.source || '—'}</p>
                <p className="text-gray-400 text-xs">Medium: {utm.medium || '—'}</p>
                <p className="text-gray-400 text-xs">Campaign: {utm.campaign || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Survey */}
      {user.surveyResponse && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Survey Answers</h2>
          <div className="p-4 rounded-xl bg-[#151929] border border-white/5 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400">Age:</span> {user.surveyResponse.ageRange || '—'}</div>
            <div><span className="text-gray-400">Gender:</span> {user.surveyResponse.gender || '—'}</div>
            <div><span className="text-gray-400">Income:</span> {user.surveyResponse.income || '—'}</div>
            <div><span className="text-gray-400">Country:</span> {user.surveyResponse.country || '—'}</div>
            <div className="col-span-2"><span className="text-gray-400">Interests:</span> {user.surveyResponse.interests.join(', ') || '—'}</div>
          </div>
        </div>
      )}

      {/* Postbacks */}
      {user.postbacks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Postbacks ({user.postbacks.length})</h2>
          <div className="rounded-xl bg-[#151929] border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-gray-400 font-medium">Wall</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Offer</th>
                  <th className="text-right p-3 text-gray-400 font-medium">Payout</th>
                  <th className="text-center p-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-3 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {user.postbacks.map((pb) => (
                  <tr key={pb.id} className="border-b border-white/5 last:border-0">
                    <td className="p-3">{pb.offerWall.name}</td>
                    <td className="p-3 text-gray-400">{pb.offerName || pb.offerId || '—'}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(pb.payoutCents)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        pb.status === 'CREDITED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>{pb.status}</span>
                    </td>
                    <td className="p-3 text-gray-400 text-xs">{new Date(pb.createdAt).toLocaleString()}</td>
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
        <h2 className="text-lg font-semibold mb-3">Transactions ({user.transactions.length})</h2>
        <div className="rounded-xl bg-[#151929] border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">Type</th>
                <th className="text-left p-3 text-gray-400 font-medium">Description</th>
                <th className="text-right p-3 text-gray-400 font-medium">Amount</th>
                <th className="text-right p-3 text-gray-400 font-medium">Balance</th>
                <th className="text-left p-3 text-gray-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {user.transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 last:border-0">
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      tx.type === 'EARNING' ? 'bg-emerald-500/10 text-emerald-400' :
                      tx.type === 'BONUS' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{tx.type}</span>
                  </td>
                  <td className="p-3 text-gray-400">{tx.description || tx.source}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(tx.amountCents)}</td>
                  <td className="p-3 text-right text-gray-400">{formatCurrency(tx.balanceAfterCents)}</td>
                  <td className="p-3 text-gray-400 text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
