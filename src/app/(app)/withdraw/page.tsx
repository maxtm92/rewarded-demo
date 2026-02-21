'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import PageTransition from '@/components/animations/PageTransition';

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
    <PageTransition>
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Cash Out</h1>
      <p className="text-[#a9a9ca] mb-8">
        Available: <span className="text-[#01d676] font-semibold">{formatCurrency(balanceCents)}</span>
      </p>

      <form onSubmit={handleWithdraw} className="space-y-6">
        {/* Method Selection */}
        <div>
          <label className="text-sm text-[#787ead] mb-3 block">Withdrawal Method</label>
          <div className="grid grid-cols-3 gap-3">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`p-5 rounded-[20px] border text-center transition card-shadow ${
                  method === m.id
                    ? 'border-[#01d676] bg-[#01d676]/10'
                    : 'border-[#393e56] bg-[#1d1d2e] hover:border-[#01d676]/50'
                }`}
              >
                <span className="text-3xl block mb-2">{m.icon}</span>
                <span className="text-sm font-medium text-white">{m.label}</span>
                <span className="text-xs text-[#787ead] block">Min {formatCurrency(m.min)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm text-[#787ead] mb-3 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787ead] text-lg">$</span>
            <input
              type="number"
              step="0.01"
              min={selectedMethod.min / 100}
              max={balanceCents / 100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-5 rounded-[20px] bg-[#2f3043] border border-[#393e56] text-white text-lg font-semibold focus:outline-none focus:border-[#01d676] transition placeholder-[#787ead]"
            />
          </div>
          {amount && !isValid && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#ff4757] text-sm mt-2"
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
              className="flex-1 py-2.5 rounded-xl bg-[#2f3043] hover:bg-[#42435a] text-white text-sm font-medium transition"
            >
              {val === balanceCents / 100 ? 'Max' : `$${val}`}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full py-5 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed glow-green-cta"
        >
          {loading ? 'Processing...' : `Withdraw ${amount ? formatCurrency(amountCents) : '$0.00'}`}
        </button>
      </form>
    </div>
    </PageTransition>
  );
}
