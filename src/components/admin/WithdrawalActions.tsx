'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function WithdrawalActions({ id }: { id: string }) {
  const router = useRouter();

  async function handleAction(status: 'COMPLETED' | 'REJECTED') {
    const res = await fetch('/api/admin/withdrawals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success(`Withdrawal ${status.toLowerCase()}`);
      router.refresh();
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleAction('COMPLETED')}
        className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 transition"
      >
        Approve
      </button>
      <button
        onClick={() => handleAction('REJECTED')}
        className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition"
      >
        Reject
      </button>
    </div>
  );
}
