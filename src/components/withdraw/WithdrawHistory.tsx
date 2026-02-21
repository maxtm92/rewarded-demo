'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';
import Link from 'next/link';

interface Withdrawal {
  id: string;
  amountCents: number;
  method: string;
  destination: string | null;
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

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING:    { bg: 'bg-[#787ead]/15', text: 'text-[#787ead]', dot: 'bg-[#787ead]' },
  PROCESSING: { bg: 'bg-[#fac401]/15', text: 'text-[#fac401]', dot: 'bg-[#fac401]' },
  COMPLETED:  { bg: 'bg-[#01d676]/15', text: 'text-[#01d676]', dot: 'bg-[#01d676]' },
  REJECTED:   { bg: 'bg-[#ff4757]/15', text: 'text-[#ff4757]', dot: 'bg-[#ff4757]' },
};

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

export default function WithdrawHistory({ refreshKey }: { refreshKey: number }) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/withdrawals')
      .then(r => r.json())
      .then(data => { setWithdrawals(data.withdrawals ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [refreshKey]);

  if (!loaded) {
    return (
      <div className="space-y-3" id="withdrawal-history">
        <h2 className="text-lg font-bold text-white">Recent Withdrawals</h2>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-xl bg-[#1d1d2e] border border-[#393e56] animate-pulse" />
        ))}
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div id="withdrawal-history">
        <h2 className="text-lg font-bold text-white mb-4">Recent Withdrawals</h2>
        <div className="rounded-xl bg-[#1d1d2e] border border-[#393e56] p-8 text-center">
          <p className="text-[#787ead] text-sm">No withdrawals yet. Make your first cashout above!</p>
        </div>
      </div>
    );
  }

  return (
    <div id="withdrawal-history">
      <h2 className="text-lg font-bold text-white mb-4">Recent Withdrawals</h2>
      <StaggerList className="space-y-3">
        {withdrawals.slice(0, 5).map(w => {
          const isExpanded = expanded === w.id;
          const isRejected = w.status === 'REJECTED';
          const sc = statusConfig[w.status] ?? statusConfig.PENDING;

          return (
            <StaggerItem key={w.id}>
              <div className="rounded-xl bg-[#1d1d2e] border border-[#393e56] overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : w.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#252539] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
                    <div>
                      <p className="text-white text-sm font-medium">{w.method} — {formatCurrency(w.amountCents)}</p>
                      <p className="text-[#787ead] text-xs">{formatDate(w.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${sc.bg} ${sc.text}`}>
                      {w.status}
                    </span>
                    <svg className={`w-4 h-4 text-[#787ead] transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerList>

      {withdrawals.length > 5 && (
        <div className="mt-4 text-center">
          <Link href="/dashboard" className="text-[#01d676] text-sm font-medium hover:underline">
            View all on dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}
