'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import PageTransition from '@/components/animations/PageTransition';
import Link from 'next/link';

/* ── Payment Methods ── */

const popularMethods = [
  { id: 'PAYPAL',       label: 'PayPal',        color: 'from-[#003087] to-[#009cde]', textColor: 'text-white', icon: 'P', bold: true, min: 500 },
  { id: 'VENMO',        label: 'Venmo',          color: 'from-[#008CFF] to-[#3D95CE]', textColor: 'text-white', icon: 'venmo', bold: false, min: 500 },
  { id: 'GOOGLE_PLAY',  label: 'Google Play',    color: 'from-[#34A853] to-[#4285F4]', textColor: 'text-white', icon: '▶', bold: false, min: 500 },
  { id: 'AMAZON',       label: 'Amazon',         color: 'from-[#232F3E] to-[#131921]', textColor: 'text-white', icon: '⌒', bold: false, min: 500 },
  { id: 'APPLE',        label: 'Apple',          color: 'from-[#a855f7] to-[#6366f1]', textColor: 'text-white', icon: '', bold: false, min: 500 },
  { id: 'VISA',         label: 'Visa Prepaid',   color: 'from-[#1A1F71] to-[#2566AF]', textColor: 'text-white', icon: 'VISA', bold: true, min: 1000 },
  { id: 'BANK',         label: 'Bank Transfer',  color: 'from-[#2f3043] to-[#1d1d2e]', textColor: 'text-white', icon: '🏦', bold: false, min: 2000 },
];

const cryptoMethods = [
  { id: 'BTC',  label: 'Bitcoin',   color: 'from-[#F7931A] to-[#E8850A]', textColor: 'text-white', icon: '₿', bold: true, min: 500 },
  { id: 'LTC',  label: 'Litecoin',  color: 'from-[#838383] to-[#545454]', textColor: 'text-white', icon: 'Ł', bold: true, min: 500 },
  { id: 'SOL',  label: 'Solana',    color: 'from-[#14F195] to-[#9945FF]', textColor: 'text-black', icon: '◎', bold: false, min: 500 },
  { id: 'DOGE', label: 'Dogecoin',  color: 'from-[#C2A633] to-[#BA9F33]', textColor: 'text-white', icon: 'Ð', bold: true, min: 250 },
];

export default function WithdrawPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const balanceCents = session?.user?.balanceCents ?? 0;
  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const allMethods = [...popularMethods, ...cryptoMethods];
  const selectedMethod = allMethods.find(m => m.id === selected);
  const minCents = selectedMethod?.min ?? 500;
  const isValid = selected && amountCents >= minCents && amountCents <= balanceCents;

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: selected, amountCents }),
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

  function MethodCard({ method, showBonus = false }: { method: typeof popularMethods[0]; showBonus?: boolean }) {
    const isActive = selected === method.id;
    return (
      <button
        type="button"
        onClick={() => { setSelected(method.id); setAmount(''); }}
        className={`flex flex-col items-center transition-all duration-200 ${
          isActive ? 'scale-[1.03]' : 'hover:scale-[1.02]'
        }`}
      >
        {/* Header / Label */}
        <span className="text-[#a9a9ca] text-[11px] md:text-xs font-semibold mb-2 truncate w-full text-center">
          {method.label}
        </span>

        {/* Card body */}
        <div className={`relative w-full aspect-[4/5] rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center border-2 transition-all overflow-hidden ${
          isActive ? 'border-[#01d676] shadow-[0_0_20px_rgba(1,214,118,0.3)]' : 'border-transparent hover:border-[#393e56]'
        }`}>
          <span className={`${method.bold ? 'font-extrabold' : 'font-bold'} text-3xl md:text-4xl ${method.textColor} drop-shadow-lg`}>
            {method.icon}
          </span>
          {/* +30% Bonus badge */}
          {showBonus && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#01d676] text-black text-[9px] font-bold leading-tight">
              +30%
            </span>
          )}
        </div>

        {/* Footer: progress bar + withdraw text */}
        <div className="w-full mt-2.5 flex flex-col items-center gap-1.5">
          <div className="w-full h-[3px] rounded-full bg-[#2f3043] overflow-hidden">
            <div className={`h-full rounded-full transition-all ${
              isActive ? 'bg-[#01d676] w-full' : 'bg-[#01d676]/60 w-full'
            }`} />
          </div>
          <span className={`text-[10px] md:text-xs font-semibold transition-colors ${
            isActive ? 'text-[#01d676]' : 'text-[#01d676]/70'
          }`}>
            Withdraw now
          </span>
        </div>
      </button>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Cashout</h1>
          <p className="text-[#a9a9ca] text-sm md:text-base mb-1">
            Redeem your Easy Task Cash earnings directly to PayPal, Amazon, Bitcoin and more!
          </p>
          <p className="text-[#a9a9ca] text-sm md:text-base">
            Withdraw to your crypto wallet starting at just <span className="text-white font-semibold">$0.50</span>, and to PayPal starting at <span className="text-white font-semibold">$5.00</span>!
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="balance-badge rounded-full px-4 py-2 flex items-center gap-2">
              <span className="text-[#01d676] font-semibold">Balance:</span>
              <span className="text-white font-bold">{formatCurrency(balanceCents)}</span>
            </div>
            <Link href="/dashboard" className="text-[#01d676] text-sm font-medium border border-[#01d676]/30 rounded-lg px-3 py-1.5 hover:bg-[#01d676]/10 transition">
              My withdrawals
            </Link>
          </div>
        </div>

        <form onSubmit={handleWithdraw}>
          {/* ── Most Popular ── */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-white mb-5">Most Popular</h2>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3 md:gap-4">
              {popularMethods.map((m, i) => (
                <MethodCard key={m.id} method={m} showBonus={i === 0} />
              ))}
            </div>
          </section>

          {/* ── Crypto ── */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-white mb-5">Crypto</h2>
            <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-lg">
              {cryptoMethods.map(m => (
                <MethodCard key={m.id} method={m} />
              ))}
            </div>
          </section>

          {/* ── Withdrawal Form (slides in when method selected) ── */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-[20px] bg-[#1d1d2e] border border-[#393e56] p-6 md:p-8 max-w-lg">
                  <h3 className="text-lg font-bold text-white mb-1">
                    Withdraw to {selectedMethod?.label}
                  </h3>
                  <p className="text-[#787ead] text-sm mb-5">
                    Minimum: {formatCurrency(minCents)}
                  </p>

                  {/* Amount */}
                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787ead] text-lg">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={minCents / 100}
                      max={balanceCents / 100}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-4 rounded-xl bg-[#2f3043] border border-[#393e56] text-white text-lg font-semibold focus:outline-none focus:border-[#01d676] transition placeholder-[#787ead]"
                    />
                  </div>

                  {amount && !isValid && (
                    <p className="text-[#ff4757] text-sm mb-4">
                      {amountCents < minCents
                        ? `Minimum is ${formatCurrency(minCents)}`
                        : `Maximum is ${formatCurrency(balanceCents)}`}
                    </p>
                  )}

                  {/* Quick amounts */}
                  <div className="flex gap-2 mb-5">
                    {[5, 10, 25].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toFixed(2))}
                        className="flex-1 py-2.5 rounded-xl bg-[#2f3043] hover:bg-[#42435a] text-white text-sm font-medium transition border border-[#393e56]"
                      >
                        ${val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount((balanceCents / 100).toFixed(2))}
                      className="flex-1 py-2.5 rounded-xl bg-[#01d676]/10 hover:bg-[#01d676]/20 text-[#01d676] text-sm font-bold transition border border-[#01d676]/30"
                    >
                      Max
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid || loading}
                    className="w-full py-4 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-bold text-base transition disabled:opacity-50 disabled:cursor-not-allowed glow-green-cta"
                  >
                    {loading ? 'Processing...' : `Withdraw ${amount ? formatCurrency(amountCents) : '$0.00'}`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </PageTransition>
  );
}
