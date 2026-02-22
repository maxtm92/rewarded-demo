'use client';

import Link from 'next/link';
import AnimatedBalance from '@/components/animations/AnimatedBalance';
import CountUp from '@/components/animations/CountUp';

interface Props {
  balanceCents: number;
  todayCents: number;
  weekCents: number;
  lifetimeCents: number;
  userName: string | null;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function BalanceHeroClient({ balanceCents, todayCents, weekCents, lifetimeCents, userName }: Props) {
  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#01d676]/20 via-[#0a2e1f] to-[#1d1d2e] border border-[#01d676]/20 relative overflow-hidden mb-6">
      {/* Glow orbs */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#01d676]/10 rounded-full blur-3xl animate-float-orb" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#01d676]/5 rounded-full blur-2xl" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-[#fac401]/5 rounded-full blur-2xl" />

      {/* Greeting */}
      <div className="flex items-start justify-between gap-4 mb-4 relative">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="text-[#787ead] text-sm mt-0.5">
            Lifetime earned: <span className="text-[#01d676] font-semibold">
              <CountUp to={lifetimeCents / 100} prefix="$" duration={1.5} />
            </span>
          </p>
        </div>
      </div>

      {/* Balance */}
      <p className="text-[#01d676]/70 text-sm font-medium mb-1 relative">Available Balance</p>
      <p className="text-5xl md:text-6xl font-extrabold text-white relative mb-4">
        $<AnimatedBalance value={balanceCents} />
      </p>

      {/* Today + This Week earnings */}
      <div className="flex items-center gap-4 md:gap-6 mb-5 relative">
        {todayCents > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-[#01d676]/10 border border-[#01d676]/20">
            <span className="text-[#787ead] text-xs">Today </span>
            <span className="text-[#01d676] font-bold text-sm">
              +<CountUp to={todayCents / 100} prefix="$" duration={1.2} />
            </span>
          </div>
        )}
        {weekCents > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-[#01d676]/10 border border-[#01d676]/20">
            <span className="text-[#787ead] text-xs">This Week </span>
            <span className="text-[#01d676] font-bold text-sm">
              +<CountUp to={weekCents / 100} prefix="$" duration={1.5} />
            </span>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-3 relative">
        <Link
          href="/withdraw"
          className="px-6 py-3 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-semibold text-sm transition glow-green-cta btn-hover"
        >
          Cash Out
        </Link>
        <Link
          href="/earn"
          className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm hover:bg-white/15 transition btn-hover"
        >
          Earn More
        </Link>
      </div>
    </div>
  );
}
