'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

function getTimeUntilMidnightUTC() {
  const now = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0
  ));
  const diff = midnight.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function BonusCountdown({ className }: { className?: string }) {
  const [time, setTime] = useState(getTimeUntilMidnightUTC);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeUntilMidnightUTC()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={cn(
      'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#fac401]/5 border border-[#fac401]/20 animate-pulse-glow-gold',
      className
    )}>
      <span className="text-[#fac401] text-sm">
        Claim your <span className="font-bold">$5 bonus</span> — expires in
      </span>
      <span className="font-mono tabular-nums text-white font-bold text-sm">
        {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
      </span>
    </div>
  );
}
