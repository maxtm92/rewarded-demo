'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  userId: string;
  isBanned: boolean;
  currentBalanceCents: number;
}

export default function UserAdminActions({ userId, isBanned, currentBalanceCents }: Props) {
  const [loading, setLoading] = useState(false);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [adjustError, setAdjustError] = useState('');
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [showAdjustWarning, setShowAdjustWarning] = useState(false);
  const router = useRouter();

  async function handleBanToggle() {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: isBanned ? 'unban' : 'ban' }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      router.refresh();
    } finally {
      setLoading(false);
      setShowBanConfirm(false);
    }
  }

  async function submitAdjust() {
    if (!amount || !reason) return;
    setLoading(true);
    setMessage('');
    try {
      const cents = Math.round(parseFloat(amount) * 100);
      const finalCents = adjustType === 'debit' ? -cents : cents;
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'adjust', amountCents: finalCents, reason }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      setAmount('');
      setReason('');
      router.refresh();
    } finally {
      setLoading(false);
      setShowAdjustWarning(false);
    }
  }

  function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !reason) return;

    const cents = Math.round(parseFloat(amount) * 100);

    // Debit validation
    if (adjustType === 'debit' && cents > currentBalanceCents) {
      setAdjustError(`Cannot debit more than current balance ($${(currentBalanceCents / 100).toFixed(2)})`);
      return;
    }
    setAdjustError('');

    // Large adjustment warning
    if (cents > 5000) {
      setShowAdjustWarning(true);
      return;
    }

    submitAdjust();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Admin Actions</h2>

      {message && (
        <div className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm">
          {message}
        </div>
      )}

      {/* Ban / Unban */}
      <div className="p-4 rounded-xl bg-[#151929] border border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Account Status</p>
            <p className="text-xs text-gray-400 mt-1">
              {isBanned ? 'This user is currently banned' : 'This user is active'}
            </p>
          </div>
          <button
            onClick={() => setShowBanConfirm(true)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
              isBanned
                ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20'
                : 'bg-red-600/10 text-red-400 hover:bg-red-600/20'
            }`}
          >
            {isBanned ? 'Unban User' : 'Ban User'}
          </button>
        </div>
      </div>

      {/* Balance Adjustment */}
      <form onSubmit={handleAdjust} className="p-4 rounded-xl bg-[#151929] border border-white/5 space-y-4">
        <p className="font-medium text-sm">Balance Adjustment</p>
        <p className="text-xs text-gray-400">
          Current balance: ${(currentBalanceCents / 100).toFixed(2)}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setAdjustType('credit'); setAdjustError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              adjustType === 'credit' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-[#2f3043] text-gray-400'
            }`}
          >
            + Credit
          </button>
          <button
            type="button"
            onClick={() => { setAdjustType('debit'); setAdjustError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              adjustType === 'debit' ? 'bg-red-600/20 text-red-400' : 'bg-[#2f3043] text-gray-400'
            }`}
          >
            - Debit
          </button>
        </div>

        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setAdjustError(''); }}
          placeholder="Amount in dollars (e.g. 5.00)"
          className="w-full px-4 py-2.5 rounded-lg bg-[#2f3043] border border-[#393e56] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        {adjustError && <p className="text-red-400 text-xs -mt-2">{adjustError}</p>}

        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (required)"
          className="w-full px-4 py-2.5 rounded-lg bg-[#2f3043] border border-[#393e56] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />

        <button
          type="submit"
          disabled={loading || !amount || !reason}
          className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : `${adjustType === 'credit' ? 'Credit' : 'Debit'} $${amount || '0.00'}`}
        </button>
      </form>

      {/* Ban Confirmation */}
      <ConfirmDialog
        open={showBanConfirm}
        title={isBanned ? 'Unban User' : 'Ban User'}
        description={
          isBanned
            ? 'Are you sure you want to unban this user? They will regain access to the platform.'
            : 'Are you sure you want to ban this user? They will lose access to the platform.'
        }
        confirmLabel={isBanned ? 'Unban' : 'Ban'}
        confirmVariant={isBanned ? 'success' : 'danger'}
        loading={loading}
        onConfirm={handleBanToggle}
        onCancel={() => setShowBanConfirm(false)}
      />

      {/* Large Adjustment Warning */}
      <ConfirmDialog
        open={showAdjustWarning}
        title="Large Adjustment"
        description={`You are about to ${adjustType} $${amount || '0.00'}. Are you sure?`}
        confirmLabel="Proceed"
        confirmVariant="danger"
        loading={loading}
        onConfirm={submitAdjust}
        onCancel={() => setShowAdjustWarning(false)}
      />
    </div>
  );
}
