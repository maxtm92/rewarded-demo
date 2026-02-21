'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface Withdrawal {
  id: string;
  amountCents: number;
  method: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  estimatedCompletionAt: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function TimelineStep({ label, timestamp, isDone, isActive, isRejected }: {
  label: string;
  timestamp: string | null;
  isDone: boolean;
  isActive: boolean;
  isRejected?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
          isRejected ? 'bg-[#ff4757] text-white' :
          isDone ? 'bg-[#01d676] text-black' :
          isActive ? 'bg-[#01d676]/20 border border-[#01d676] text-[#01d676]' :
          'bg-[#2f3043] text-[#787ead]'
        }`}>
          {isRejected ? '✕' : isDone ? '✓' : isActive ? '•' : '○'}
        </div>
        <div className="w-px h-4 bg-[#393e56] last:hidden" />
      </div>
      <div className="-mt-0.5">
        <p className={`text-xs font-medium ${isDone || isActive ? 'text-white' : 'text-[#787ead]'}`}>{label}</p>
        {timestamp && <p className="text-[10px] text-[#787ead]">{formatDate(timestamp)}</p>}
        {!timestamp && !isDone && !isRejected && isActive && (
          <p className="text-[10px] text-[#fac401]">In progress...</p>
        )}
      </div>
    </div>
  );
}

export default function WithdrawalTimeline() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/withdrawals')
      .then(r => r.json())
      .then(data => setWithdrawals(data.withdrawals ?? []))
      .catch(() => {});
  }, []);

  if (withdrawals.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Recent Withdrawals</h2>
      {withdrawals.slice(0, 5).map(w => {
        const isExpanded = expanded === w.id;
        const isRejected = w.status === 'REJECTED';

        return (
          <div key={w.id} className="rounded-xl bg-[#1d1d2e] border border-[#393e56] overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : w.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  w.status === 'COMPLETED' ? 'bg-[#01d676]' :
                  w.status === 'REJECTED' ? 'bg-[#ff4757]' :
                  w.status === 'PROCESSING' ? 'bg-[#fac401]' : 'bg-[#787ead]'
                }`} />
                <div>
                  <p className="text-white text-sm font-medium">{w.method} — {formatCurrency(w.amountCents)}</p>
                  <p className="text-[#787ead] text-xs">{formatDate(w.createdAt)}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                w.status === 'COMPLETED' ? 'bg-[#01d676]/15 text-[#01d676]' :
                w.status === 'REJECTED' ? 'bg-[#ff4757]/15 text-[#ff4757]' :
                w.status === 'PROCESSING' ? 'bg-[#fac401]/15 text-[#fac401]' : 'bg-[#787ead]/15 text-[#787ead]'
              }`}>
                {w.status}
              </span>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-1">
                <TimelineStep label="Requested" timestamp={w.createdAt} isDone={true} isActive={false} />
                <TimelineStep
                  label="Processing"
                  timestamp={w.processedAt}
                  isDone={!!w.processedAt}
                  isActive={w.status === 'PROCESSING'}
                  isRejected={isRejected}
                />
                {isRejected ? (
                  <TimelineStep label="Rejected" timestamp={w.rejectedAt} isDone={false} isActive={false} isRejected={true} />
                ) : (
                  <TimelineStep
                    label="Completed"
                    timestamp={w.completedAt}
                    isDone={!!w.completedAt}
                    isActive={w.status === 'COMPLETED'}
                  />
                )}
                {w.estimatedCompletionAt && !w.completedAt && !isRejected && (
                  <p className="text-[10px] text-[#787ead] ml-8">
                    Est. completion: {formatDate(w.estimatedCompletionAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
