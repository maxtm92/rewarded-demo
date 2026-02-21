'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import PageTransition from '@/components/animations/PageTransition';
import WithdrawConfirmModal from '@/components/withdraw/WithdrawConfirmModal';
import WithdrawSuccess from '@/components/withdraw/WithdrawSuccess';
import WithdrawHistory from '@/components/withdraw/WithdrawHistory';

/* ── Payment Methods ── */

interface PaymentMethod {
  id: string;
  label: string;
  color: string;
  logo: string;
  min: number;
  time: string;
}

const popularMethods: PaymentMethod[] = [
  { id: 'STAKE',        label: 'Stake',          color: 'from-[#2f4553] to-[#1a2c38]', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M6 2h12L12 12l6 10H6l6-10L6 2z'/%3E%3C/svg%3E", min: 500, time: 'Usually within 1-24 hours' },
  { id: 'PAYPAL',       label: 'PayPal',        color: 'from-[#003087] to-[#009cde]', logo: 'https://cdn.simpleicons.org/paypal/white', min: 500, time: 'Usually within 1-4 hours' },
  { id: 'VENMO',        label: 'Venmo',          color: 'from-[#008CFF] to-[#3D95CE]', logo: 'https://cdn.simpleicons.org/venmo/white', min: 500, time: 'Usually within 1-4 hours' },
  { id: 'GOOGLE_PLAY',  label: 'Google Play',    color: 'from-[#34A853] to-[#4285F4]', logo: 'https://cdn.simpleicons.org/googleplay/white', min: 500, time: 'Usually within 1-24 hours' },
  { id: 'AMAZON',       label: 'Amazon',         color: 'from-[#232F3E] to-[#131921]', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm6.565-6.218c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02zm9.162 7.027c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z'/%3E%3C/svg%3E", min: 500, time: 'Usually within 1-24 hours' },
  { id: 'APPLE',        label: 'Apple',          color: 'from-[#a855f7] to-[#6366f1]', logo: 'https://cdn.simpleicons.org/apple/white', min: 500, time: 'Usually within 1-24 hours' },
  { id: 'VISA',         label: 'Visa Prepaid',   color: 'from-[#1A1F71] to-[#2566AF]', logo: 'https://cdn.simpleicons.org/visa/white', min: 1000, time: 'Usually 1-3 business days' },
  { id: 'BANK',         label: 'Bank Transfer',  color: 'from-[#2f3043] to-[#1d1d2e]', logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath fill-rule='evenodd' d='M12.433 1.2a1 1 0 00-.866 0l-9 5A1 1 0 002 7.13V8a1 1 0 001 1h18a1 1 0 001-1v-.87a1 1 0 00-.567-.9l-9-5ZM12 6a1 1 0 100-2 1 1 0 000 2ZM5 11v7H4a1 1 0 100 2h16a1 1 0 100-2h-1v-7h-2v7h-3v-7h-2v7H9v-7H7v7H5v-7Z'/%3E%3C/svg%3E", min: 2000, time: 'Usually 1-3 business days' },
];

const cryptoMethods: PaymentMethod[] = [
  { id: 'BTC',  label: 'Bitcoin',   color: 'from-[#F7931A] to-[#E8850A]', logo: 'https://cdn.simpleicons.org/bitcoin/white', min: 500, time: 'Usually within 15-60 minutes' },
  { id: 'LTC',  label: 'Litecoin',  color: 'from-[#838383] to-[#545454]', logo: 'https://cdn.simpleicons.org/litecoin/white', min: 500, time: 'Usually within 15-60 minutes' },
  { id: 'SOL',  label: 'Solana',    color: 'from-[#14F195] to-[#9945FF]', logo: 'https://cdn.simpleicons.org/solana/white', min: 500, time: 'Usually within 15-60 minutes' },
  { id: 'DOGE', label: 'Dogecoin',  color: 'from-[#C2A633] to-[#BA9F33]', logo: 'https://cdn.simpleicons.org/dogecoin/white', min: 250, time: 'Usually within 15-60 minutes' },
];

const destinationPlaceholders: Record<string, string> = {
  STAKE:       'Stake username or email',
  PAYPAL:      'PayPal email address',
  VENMO:       'Venmo username or phone',
  GOOGLE_PLAY: 'Google account email',
  AMAZON:      'Amazon email address',
  APPLE:       'Apple ID email',
  VISA:        'Mailing address for card delivery',
  BANK:        'Account & routing number',
  BTC:         'Bitcoin wallet address',
  LTC:         'Litecoin wallet address',
  SOL:         'Solana wallet address',
  DOGE:        'Dogecoin wallet address',
};

export default function WithdrawPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastWithdrawal, setLastWithdrawal] = useState<{ method: string; amount: string; time: string } | null>(null);
  const [amountError, setAmountError] = useState('');
  const [destError, setDestError] = useState('');
  const [historyKey, setHistoryKey] = useState(0);

  const balanceCents = session?.user?.balanceCents ?? 0;
  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const allMethods = [...popularMethods, ...cryptoMethods];
  const selectedMethod = allMethods.find(m => m.id === selected);
  const minCents = selectedMethod?.min ?? 500;
  const isValid = selected && amountCents >= minCents && amountCents <= balanceCents && destination.trim().length > 0;

  function validateAmount() {
    if (!amount) { setAmountError(''); return; }
    if (amountCents < minCents) {
      setAmountError(`Minimum is ${formatCurrency(minCents)}`);
    } else if (amountCents > balanceCents) {
      setAmountError(`Maximum is ${formatCurrency(balanceCents)}`);
    } else {
      setAmountError('');
    }
  }

  function validateDest() {
    if (destination.trim().length === 0 && destination.length > 0) {
      setDestError('Destination is required');
    } else {
      setDestError('');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let hasError = false;
    if (amountCents < minCents) {
      setAmountError(`Minimum is ${formatCurrency(minCents)}`);
      hasError = true;
    } else if (amountCents > balanceCents) {
      setAmountError(`Maximum is ${formatCurrency(balanceCents)}`);
      hasError = true;
    }
    if (!destination.trim()) {
      setDestError('Destination is required');
      hasError = true;
    }
    if (hasError || !isValid) return;
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: selected, amountCents, destination }),
      });

      if (res.ok) {
        setShowConfirm(false);
        setLastWithdrawal({
          method: selectedMethod?.label ?? '',
          amount: formatCurrency(amountCents),
          time: selectedMethod?.time ?? 'Usually within 1-24 hours',
        });
        setShowSuccess(true);
        setHistoryKey(k => k + 1);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Withdrawal failed');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    setSelected(null);
    setAmount('');
    setDestination('');
    setAmountError('');
    setDestError('');
  }, []);

  const handleViewHistory = useCallback(() => {
    setShowSuccess(false);
    document.getElementById('withdrawal-history')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  function MethodCard({ method, showBonus = false }: { method: PaymentMethod; showBonus?: boolean }) {
    const isActive = selected === method.id;
    return (
      <button
        type="button"
        onClick={() => { setSelected(method.id); setAmount(''); setDestination(''); setAmountError(''); setDestError(''); }}
        className={`flex flex-col items-center withdraw-method-card ${isActive ? 'active' : ''}`}
      >
        <span className="text-[#a9a9ca] text-[11px] md:text-xs font-semibold mb-2 truncate w-full text-center">
          {method.label}
        </span>

        <div className={`relative w-full aspect-[4/5] rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center border-2 overflow-hidden ${
          isActive ? 'border-[#01d676]' : 'border-transparent hover:border-[#393e56]'
        }`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={method.logo}
            alt={method.label}
            className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg"
          />
          {showBonus && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#01d676] text-black text-[9px] font-bold leading-tight">
              +30%
            </span>
          )}
        </div>

        <div className="w-full mt-2.5 flex flex-col items-center gap-1.5">
          <div className="w-full h-[3px] rounded-full bg-[#2f3043] overflow-hidden">
            <div className={`h-full rounded-full transition-all ${
              isActive ? 'bg-[#01d676] w-full' : 'bg-[#01d676]/60 w-full'
            }`} />
          </div>
          <span className={`text-[10px] md:text-xs font-semibold transition-colors ${
            isActive ? 'text-[#01d676]' : 'text-[#01d676]/70'
          }`}>
            Min {formatCurrency(method.min)}
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
          <div className="mt-4">
            <div className="balance-badge rounded-full px-4 py-2 inline-flex items-center gap-2">
              <span className="text-[#01d676] font-semibold">Balance:</span>
              <span className="text-white font-bold">{formatCurrency(balanceCents)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Most Popular */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-white mb-5">Most Popular</h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
              {popularMethods.map(m => (
                <MethodCard key={m.id} method={m} showBonus={m.id === 'STAKE'} />
              ))}
            </div>
          </section>

          {/* Crypto */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-white mb-5">Crypto</h2>
            <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-lg">
              {cryptoMethods.map(m => (
                <MethodCard key={m.id} method={m} />
              ))}
            </div>
          </section>

          {/* Withdrawal Form */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-10"
              >
                <div className="rounded-[20px] withdraw-form-card p-6 md:p-8 max-w-lg">
                  <h3 className="text-lg font-bold text-white mb-1">
                    Withdraw to {selectedMethod?.label}
                  </h3>
                  <p className="text-[#787ead] text-sm mb-5">
                    Minimum: {formatCurrency(minCents)}
                  </p>

                  {/* Amount */}
                  <div className="mb-1">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787ead] text-lg">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min={minCents / 100}
                        max={balanceCents / 100}
                        value={amount}
                        onChange={(e) => { setAmount(e.target.value); setAmountError(''); }}
                        onBlur={validateAmount}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-4 rounded-xl bg-[#2f3043] border border-[#393e56] text-white text-lg font-semibold focus:outline-none focus:border-[#01d676] transition placeholder-[#787ead]"
                      />
                    </div>
                  </div>

                  {/* Amount error or balance preview */}
                  <div className="mb-4 min-h-[20px]">
                    <AnimatePresence mode="wait">
                      {amountError ? (
                        <motion.p key="error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[#ff4757] text-sm">
                          {amountError}
                        </motion.p>
                      ) : amount && amountCents > 0 && amountCents <= balanceCents ? (
                        <motion.p key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[#787ead] text-xs">
                          Balance after: <span className="text-white font-medium">{formatCurrency(balanceCents - amountCents)}</span>
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  {/* Destination */}
                  <div className="mb-1">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => { setDestination(e.target.value); setDestError(''); }}
                      onBlur={validateDest}
                      placeholder={selectedMethod ? destinationPlaceholders[selectedMethod.id] ?? 'Destination' : 'Destination'}
                      className="w-full px-4 py-4 rounded-xl bg-[#2f3043] border border-[#393e56] text-white text-base font-semibold focus:outline-none focus:border-[#01d676] transition placeholder-[#787ead]"
                      required
                    />
                  </div>
                  <div className="mb-4 min-h-[20px]">
                    <AnimatePresence>
                      {destError && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[#ff4757] text-sm">
                          {destError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quick amounts */}
                  <div className="flex gap-2 mb-4">
                    {[5, 10, 25, 50].map(val => (
                      <button key={val} type="button" onClick={() => { setAmount(val.toFixed(2)); setAmountError(''); }}
                        className="flex-1 py-2.5 rounded-xl bg-[#2f3043] hover:bg-[#42435a] text-white text-sm font-medium transition border border-[#393e56]">
                        ${val}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setAmount((balanceCents / 100).toFixed(2)); setAmountError(''); }}
                      className="flex-1 py-2.5 rounded-xl bg-[#01d676]/10 hover:bg-[#01d676]/20 text-[#01d676] text-sm font-bold transition border border-[#01d676]/30">
                      Max
                    </button>
                  </div>

                  {/* Processing time */}
                  {selectedMethod && (
                    <div className="flex items-center gap-2 text-xs text-[#787ead] mb-5">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {selectedMethod.time}
                    </div>
                  )}

                  <button type="submit" disabled={!isValid}
                    className="w-full py-4 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-bold text-base transition disabled:opacity-50 disabled:cursor-not-allowed glow-green-cta active:scale-[0.98]">
                    Withdraw {amount ? formatCurrency(amountCents) : '$0.00'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Withdrawal History */}
        <section className="mt-2">
          <WithdrawHistory refreshKey={historyKey} />
        </section>
      </div>

      {/* Confirmation Modal */}
      <WithdrawConfirmModal
        open={showConfirm}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        methodLabel={selectedMethod?.label ?? ''}
        methodIcon={selectedMethod && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selectedMethod.logo} alt={selectedMethod.label} className="w-full h-full" />
        )}
        amount={formatCurrency(amountCents)}
        destination={destination}
        processingTime={selectedMethod?.time ?? 'Usually within 1-24 hours'}
        loading={loading}
      />

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && lastWithdrawal && (
          <WithdrawSuccess
            methodLabel={lastWithdrawal.method}
            amount={lastWithdrawal.amount}
            processingTime={lastWithdrawal.time}
            onClose={handleSuccessClose}
            onViewHistory={handleViewHistory}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
