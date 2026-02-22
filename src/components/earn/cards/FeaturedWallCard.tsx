'use client';

import Link from 'next/link';

interface FeaturedWallCardProps {
  name: string;
  icon: string;
  logoUrl?: string | null;
  bonusText?: string | null;
  bonusDetail?: string | null;
  slug?: string;
}

export default function FeaturedWallCard({ name, icon, logoUrl, bonusText, bonusDetail, slug }: FeaturedWallCardProps) {
  const bonus = bonusText || '$5';
  const detail = bonusDetail || 'Complete an offer to claim';

  const content = (
    <div className="flex flex-col md:flex-row">
      <div className="relative md:w-64 h-44 md:h-auto bg-gradient-to-br from-[#01d676]/30 via-[#0a2e1f] to-[#141523] flex-shrink-0">
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          {logoUrl ? (
            <div className="w-24 h-24 rounded-2xl bg-[#1d1d2e]/60 backdrop-blur-md border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500">
              <img src={logoUrl} alt={name} className="w-full h-full object-contain rounded-xl" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-[#1d1d2e]/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-md bg-[#01d676]/20 text-[#01d676] text-[11px] font-bold uppercase tracking-wider">
            Most Popular
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#fac401]/15 text-[#fac401] text-[11px] font-bold uppercase tracking-wider">
            Featured
          </span>
          <span className="relative flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 text-[11px] font-bold uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" />
            </span>
            LIVE
          </span>
        </div>

        <h3 className="text-2xl font-extrabold text-white mb-2 group-hover:text-[#01d676] transition-colors">
          {name}
        </h3>

        <p className="text-xl font-extrabold text-[#01d676] mb-1">
          💰 $5 — $2,500 per offer
        </p>
        <p className="text-sm text-[#a9a9ca] mb-5">
          + {bonus} bonus · {detail}
        </p>

        <div className="flex items-center gap-4">
          <div className="px-8 py-3 rounded-xl bg-[#01d676] text-black font-bold text-sm text-center transition-all group-hover:bg-[#01ff97] glow-green-cta btn-hover">
            Download & Earn {bonus} →
          </div>
          <div className="flex items-center gap-1 text-[#fac401] text-sm">
            <span>★★★★★</span>
            <span className="text-[#787ead] text-xs ml-1">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );

  const cls = "earn-card block rounded-[20px] bg-[#1d1d2e] border border-[#01d676]/30 overflow-hidden transition-all duration-300 group shadow-[0_0_30px_rgba(1,214,118,0.12)] hover:shadow-[0_0_50px_rgba(1,214,118,0.25)] hover:border-[#01d676]/60";

  if (slug) {
    return <Link href={`/earn/${slug}`} className={cls}>{content}</Link>;
  }
  return <div className={cls}>{content}</div>;
}
