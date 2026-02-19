import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import WithdrawalActions from '@/components/admin/WithdrawalActions';

export const dynamic = 'force-dynamic';

export default async function WithdrawalsPage() {
  const withdrawals = await prisma.withdrawal.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 100,
    include: { user: { select: { email: true, name: true, phone: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Withdrawals</h1>

      <div className="rounded-xl bg-[#151929] border border-white/5 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-3 text-gray-400 font-medium">User</th>
              <th className="text-left p-3 text-gray-400 font-medium">Method</th>
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
                <td className="p-3 text-right font-medium">{formatCurrency(w.amountCents)}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                    w.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                    w.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{w.status}</span>
                </td>
                <td className="p-3 text-gray-400 text-xs">{new Date(w.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-center">
                  {w.status === 'PENDING' && (
                    <WithdrawalActions id={w.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
