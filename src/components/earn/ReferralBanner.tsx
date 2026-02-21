'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ReferralBanner({ inline = false }: { inline?: boolean }) {
  const { data: session } = useSession();
  if (!session?.user) return null;

  if (inline) {
    return (
      <Link
        href="/referral"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#01d676]/10 hover:bg-[#01d676]/20 text-[#01d676] text-xs font-bold transition border border-[#01d676]/30 whitespace-nowrap flex-shrink-0"
      >
        <span>🤝</span> Invite Friends →
      </Link>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#1d1d2e] to-[#22223a] border border-[#393e56] p-5 card-inset">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤝</span>
          <div>
            <p className="text-white font-bold text-sm">Invite Friends, Earn 10%</p>
            <p className="text-[#787ead] text-xs">Earn 10% of everything your friends earn. Forever.</p>
          </div>
        </div>
        <Link
          href="/referral"
          className="px-4 py-2 rounded-xl bg-[#01d676]/10 hover:bg-[#01d676]/20 text-[#01d676] text-sm font-bold transition border border-[#01d676]/30 btn-hover whitespace-nowrap"
        >
          Share Link
        </Link>
      </div>
    </div>
  );
}
