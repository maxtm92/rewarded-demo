'use client';

import Link from 'next/link';

interface WallCardProps {
  name: string;
  icon: string;
  logoUrl?: string | null;
  bonusText?: string | null;
  bonusDetail?: string | null;
  section: 'games' | 'surveys';
  slug?: string;
}

export default function WallCard({ name, icon, logoUrl, bonusText, bonusDetail, section, slug }: WallCardProps) {
  const bonus = bonusText || '$5';
  const detail = bonusDetail || 'Complete an offer to claim';

  const isGames = section === 'games';
  const iconGradient = isGames
    ? 'from-[#6366f1]/30 to-[#1e1b4b]'
    : 'from-[#06b6d4]/30 to-[#083344]';
  const earningColor = isGames
    ? 'text-[#fac401]'
    : 'text-[#01d676]';
  const ctaClass = isGames
    ? 'bg-[#01d676] text-black group-hover:bg-[#01ff97] glow-green-cta'
    : 'bg-[#01d676] text-black group-hover:bg-[#01ff97] glow-green-cta';

  const content = (
    <div className="flex items-center gap-4 p-4">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
        {logoUrl ? (
          <img src={logoUrl} alt={name} className="w-10 h-10 object-contain rounded-lg" />
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-white group-hover:text-[#01d676] transition-colors truncate">
          {name}
        </h3>
        <p className={`text-sm font-bold ${earningColor} mt-0.5`}>
          💰 Earn {bonus} bonus
        </p>
        <p className="text-[#787ead] text-xs mt-0.5 mb-2.5">{detail}</p>
        <div className={`w-full py-2.5 rounded-lg font-bold text-xs text-center transition-all ${ctaClass}`}>
          Start Earning {bonus} →
        </div>
      </div>
    </div>
  );

  const cls = "earn-card block rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#01d676]/40 overflow-hidden transition-all duration-300 group hover:shadow-[0_0_20px_rgba(1,214,118,0.08)]";

  if (slug) {
    return <Link href={`/earn/${slug}`} className={cls}>{content}</Link>;
  }
  return <div className={cls}>{content}</div>;
}
