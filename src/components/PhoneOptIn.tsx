'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function PhoneOptIn() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/phone-optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (res.ok) {
        setClaimed(true);
        toast.success('$5 bonus added to your balance!');
      } else if (res.status === 409) {
        setClaimed(true);
      } else {
        const data = await res.json().catch(() => ({ error: 'Something went wrong' }));
        toast.error(data.error || 'Failed to submit');
      }
    } finally {
      setLoading(false);
    }
  }

  if (claimed) {
    return (
      <div className="rounded-2xl bg-[#01d676]/10 border border-[#01d676]/30 p-5 text-center">
        <p className="text-[#01d676] font-bold">$5 bonus claimed!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#1d1d2e] border border-[#393e56] p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#01d676]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">📱</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold mb-1">Add your phone number & earn $5!</h3>
          <p className="text-[#787ead] text-sm mb-3">
            Get $5 added to your balance instantly. By adding your number you opt in to receive marketing messages.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#141523] border border-[#393e56] text-white placeholder-[#787ead] text-sm focus:outline-none focus:border-[#01d676]/50"
            />
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-bold text-sm transition disabled:opacity-50 glow-green-cta"
            >
              {loading ? '...' : 'Claim $5'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
