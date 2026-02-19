'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const methods = [
  { id: 'PAYPAL', label: 'PayPal', icon: '💳', min: 500 },
  { id: 'GIFT_CARD', label: 'Gift Card', icon: '🎁', min: 500 },
  { id: 'CRYPTO', label: 'Crypto', icon: '₿', min: 1000 },
] as const;

export default function WithdrawPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [method, setMethod] = useState<string>('PAYPAL');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const balanceCents = session?.user?.balanceCents ?? 0;
  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const selectedMethod = methods.find((m) => m.id === method)!;
  const isValid = amountCents >= selectedMethod.min && amountCents <= balanceCents;

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, amountCents }),
      });

      if (res.ok) {
        toast.success('Withdrawal request submitted!');
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Withdrawal failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">Cash Out</h1>
      <p className="text-gray-400 mb-8">
        Available: <span className="text-emerald-400 font-semibold">{formatCurrency(balanceCents)}</span>
      </p>

      <form onSubmit={handleWithdraw} className="space-y-6">
        {/* Method Selection */}
        <div>
          <label className="text-sm text-gray-400 mb-3 block">Withdrawal Method</label>
          <div className="grid grid-cols-3 gap-3">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`p-4 rounded-xl border text-center transition ${
                  method === m.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/10 bg-[#151929] hover:border-white/20'
                }`}
              >
                <span className="text-2xl block mb-1">{m.icon}</span>
                <span className="text-sm font-medium">{m.label}</span>
                <span className="text-xs text-gray-500 block">Min {formatCurrency(m.min)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm text-gray-400 mb-3 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
            <input
              type="number"
              step="0.01"
              min={selectedMethod.min / 100}
              max={balanceCents / 100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-4 rounded-xl bg-[#151929] border border-white/10 text-white text-lg font-semibold focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          {amount && !isValid && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-2"
            >
              {amountCents < selectedMethod.min
                ? `Minimum is ${formatCurrency(selectedMethod.min)}`
                : `Maximum is ${formatCurrency(balanceCents)}`}
            </motion.p>
          )}
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2">
          {[5, 10, 25, balanceCents / 100].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val.toFixed(2))}
              className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition"
            >
              {val === balanceCents / 100 ? 'Max' : `$${val}`}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Withdraw ${amount ? formatCurrency(amountCents) : '$0.00'}`}
        </button>
      </form>
    </div>
  );
}
