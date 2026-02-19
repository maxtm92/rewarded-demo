import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>

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
                    'bg-red-500/10 text-red-400'
                  }`}>{tx.type}</span>
                </td>
                <td className="p-3 text-gray-400 text-xs">{tx.source}</td>
                <td className="p-3 text-gray-400 text-xs">{tx.description}</td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
