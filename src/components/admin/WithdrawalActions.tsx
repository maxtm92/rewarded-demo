'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  id: string;
  amountCents: number;
  method: string;
}

export default function WithdrawalActions({ id, amountCents, method }: Props) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<'COMPLETED' | 'REJECTED' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!pendingAction) return;
    if (pendingAction === 'REJECTED' && !rejectionReason.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: pendingAction,
          ...(pendingAction === 'REJECTED' ? { rejectionReason: rejectionReason.trim() } : {}),
        }),
      });
      if (res.ok) {
        toast.success(`Withdrawal ${pendingAction.toLowerCase()}`);
        router.refresh();
      } else {
        toast.error('Action failed');
      }
    } finally {
      setLoading(false);
      setPendingAction(null);
      setRejectionReason('');
    }
  }

  return (
    <>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setPendingAction('COMPLETED')}
          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100 transition"
        >
          Approve
        </button>
        <button
          onClick={() => setPendingAction('REJECTED')}
          className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs hover:bg-red-100 transition"
        >
          Reject
        </button>
      </div>

      {/* Approve Dialog */}
      <ConfirmDialog
        open={pendingAction === 'COMPLETED'}
        title="Approve Withdrawal"
        description={`Are you sure you want to approve this ${formatCurrency(amountCents)} ${method.replace('_', ' ')} withdrawal?`}
        confirmLabel="Approve"
        confirmVariant="success"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        open={pendingAction === 'REJECTED'}
        title="Reject Withdrawal"
        description={`Rejecting this ${formatCurrency(amountCents)} withdrawal will refund the user's balance. Please provide a reason.`}
        confirmLabel="Reject & Refund"
        confirmVariant="danger"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => { setPendingAction(null); setRejectionReason(''); }}
      >
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Reason for rejection (required)..."
          required
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
        />
      </ConfirmDialog>
    </>
  );
}
