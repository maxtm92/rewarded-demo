'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'EARNING' | 'WITHDRAWAL' | 'BONUS' | 'ADJUSTMENT';
  amountCents: number;
  balanceAfterCents: number;
  source: string;
  description: string | null;
  createdAt: string;
}

const filters = [
  { key: 'ALL', label: 'All' },
  { key: 'EARNING', label: 'Earnings' },
  { key: 'BONUS', label: 'Bonuses' },
  { key: 'WITHDRAWAL', label: 'Withdrawals' },
] as const;

type FilterKey = (typeof filters)[number]['key'];

function formatTxDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function TransactionFilter({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [showAll, setShowAll] = useState(false);

  const filtered = filter === 'ALL'
    ? transactions
    : transactions.filter(tx => tx.type === filter);

  const visible = showAll ? filtered : filtered.slice(0, 10);
  const hasMore = filtered.length > 10;

  if (transactions.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="text-center py-12 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-shadow">
          <span className="text-4xl mb-3 block">📭</span>
          <p className="text-[#a9a9ca]">No transactions yet. Start earning to see your activity!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setShowAll(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              filter === f.key
                ? 'bg-[#01d676]/15 text-[#01d676] border border-[#01d676]/30'
                : 'bg-[#2f3043] text-[#787ead] border border-transparent hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="rounded-2xl bg-[#1d1d2e] border border-[#393e56] overflow-hidden card-shadow">
        {visible.length === 0 ? (
          <div className="p-8 text-center text-[#787ead] text-sm">
            No {filter.toLowerCase()} transactions yet.
          </div>
        ) : (
          visible.map(tx => {
            const isPositive = tx.type !== 'WITHDRAWAL';
            const dotColor =
              tx.type === 'EARNING' ? 'bg-[#01d676]' :
              tx.type === 'BONUS' ? 'bg-[#fac401]' :
              tx.type === 'ADJUSTMENT' ? 'bg-[#787ead]' :
              'bg-[#ff4757]';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border-b border-[#393e56]/50 last:border-0 row-hover"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                  <div>
                    <p className="font-medium text-sm text-white">{tx.description || tx.source}</p>
                    <p className="text-[#787ead] text-xs">{formatTxDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${isPositive ? 'text-[#01d676]' : 'text-[#ff4757]'}`}>
                    {isPositive ? '+' : '-'}{formatCurrency(Math.abs(tx.amountCents))}
                  </p>
                  <p className="text-[#787ead] text-[11px]">
                    Bal: {formatCurrency(tx.balanceAfterCents)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-center text-[#01d676] text-sm font-medium hover:underline"
        >
          {showAll ? 'Show less' : `Show all ${filtered.length} transactions`}
        </button>
      )}
    </div>
  );
}
