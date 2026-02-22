'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface OfferCardProps {
  name: string;
  icon: string;
  headline?: string | null;
  description: string;
  payoutCents: number;
  slug?: string;
}

export default function OfferCard({ name, icon, headline, description, payoutCents, slug }: OfferCardProps) {
  const content = (
    <div className="flex items-center gap-4 p-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f59e0b]/30 to-[#451a03] flex items-center justify-center flex-shrink-0 text-2xl group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-white group-hover:text-[#fac401] transition-colors truncate">
          {headline || name}
        </h3>
        <p className="text-sm font-bold text-[#fac401] mt-0.5">
          💰 Earn {formatCurrency(payoutCents)}
        </p>
        <p className="text-[#787ead] text-xs mt-0.5 mb-2.5 line-clamp-1">{description}</p>
        <div className="w-full py-2.5 rounded-lg bg-[#fac401] text-black font-bold text-xs text-center transition-all group-hover:bg-[#ffbc11] glow-gold-cta">
          Claim {formatCurrency(payoutCents)} →
        </div>
      </div>
    </div>
  );

  const cls = "earn-card block rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#fac401]/40 overflow-hidden transition-all duration-300 group hover:shadow-[0_0_20px_rgba(250,196,1,0.08)]";

  if (slug) {
    return <Link href={`/offers/${slug}`} className={cls}>{content}</Link>;
  }
  return <div className={cls}>{content}</div>;
}
