'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { getMultiplier } from '@/lib/streak';

export default function StreakBanner({ compact = false, variant }: { compact?: boolean; variant?: 'full' | 'compact' | 'header' }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [streakData, setStreakData] = useState<{
    currentStreak: number;
    multiplier: number;
    claimedToday: boolean;
    nextBonusCents: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/streak')
      .then(r => r.json())
      .then(setStreakData)
      .catch(() => {});
  }, []);

  async function claimBonus() {
    setClaiming(true);
    try {
      const res = await fetch('/api/streak', { method: 'POST' });
      const data = await res.json();
      if (data.alreadyClaimed) {
        toast.info('Already claimed today!');
      } else {
        toast.success(`Day ${data.currentStreak} streak! +${formatCurrency(data.bonusCents)}`);
        if (data.newAchievements?.length) {
          data.newAchievements.forEach((slug: string) => {
            toast.success(`Achievement unlocked: ${slug}!`, { duration: 5000 });
          });
        }
        router.refresh();
      }
      setStreakData({
        currentStreak: data.currentStreak ?? streakData?.currentStreak ?? 0,
        multiplier: data.multiplier ?? streakData?.multiplier ?? 1.0,
        claimedToday: true,
        nextBonusCents: 0,
      });
    } catch {
      toast.error('Failed to claim bonus');
    } finally {
      setClaiming(false);
    }
  }

  // Ultra-compact header variant: show placeholder while loading to prevent layout shift
  if (variant === 'header') {
    if (!session?.user) {
      return (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2f3043] text-sm">
            <span>🔥</span>
            <span className="text-white font-bold opacity-0">0</span>
          </span>
        </div>
      );
    }
    const streak = streakData?.currentStreak ?? session.user.currentStreak ?? 0;
    const claimed = streakData?.claimedToday ?? false;
    const multiplier = streakData?.multiplier ?? getMultiplier(streak);
    const bonusCents = streakData?.nextBonusCents ?? 0;
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2f3043] text-sm">
          <span>🔥</span>
          <span className="text-white font-bold">{streak}</span>
          {multiplier > 1 && (
            <span className="text-[#fac401] text-[10px] font-bold">{multiplier}x</span>
          )}
        </span>
        {!claimed && (
          <button
            onClick={claimBonus}
            disabled={claiming}
            className="px-2.5 py-1 rounded-lg bg-[#01d676] hover:bg-[#01ff97] text-black text-xs font-bold transition disabled:opacity-50 whitespace-nowrap"
          >
            {claiming ? '...' : `Claim ${formatCurrency(bonusCents)}`}
          </button>
        )}
      </div>
    );
  }

  if (!session?.user) return null;

  const streak = streakData?.currentStreak ?? session.user.currentStreak ?? 0;
  const claimed = streakData?.claimedToday ?? false;
  const multiplier = streakData?.multiplier ?? getMultiplier(streak);
  const bonusCents = streakData?.nextBonusCents ?? 0;

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl">🔥</span>
          <span className="text-white font-bold text-sm whitespace-nowrap">{streak} Day Streak</span>
          {multiplier > 1 && (
            <span className="px-1.5 py-0.5 rounded bg-[#fac401]/15 text-[#fac401] text-[10px] font-bold">
              {multiplier}x
            </span>
          )}
          {/* Compact 7-day dots */}
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: 7 }, (_, i) => {
              const dayNum = i + 1;
              const isCompleted = streak >= dayNum;
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    isCompleted ? 'bg-[#01d676] text-black' : 'bg-[#2f3043] text-[#787ead]'
                  }`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </div>
        {!claimed && (
          <button
            onClick={claimBonus}
            disabled={claiming}
            className="px-3 py-1.5 rounded-lg bg-[#01d676] hover:bg-[#01ff97] text-black text-xs font-bold transition disabled:opacity-50 whitespace-nowrap flex-shrink-0"
          >
            {claiming ? '...' : `Claim ${formatCurrency(bonusCents)}`}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#1d1d2e] border border-[#393e56] p-4 md:p-5 card-inset">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: streak info */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">{streak} Day Streak</span>
              {multiplier > 1 && (
                <span className="px-2 py-0.5 rounded-md bg-[#fac401]/15 text-[#fac401] text-[10px] font-bold">
                  {multiplier}x BONUS
                </span>
              )}
            </div>
            <p className="text-[#787ead] text-xs mt-0.5">
              {claimed ? 'Come back tomorrow to keep your streak!' : `Claim your daily bonus!`}
            </p>
          </div>
        </div>

        {/* Right: progress dots + claim button */}
        <div className="flex items-center gap-3">
          {/* 7-day dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: 7 }, (_, i) => {
              const dayNum = i + 1;
              const isCompleted = streak >= dayNum;
              const isCurrent = streak === dayNum - 1 && !claimed;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isCompleted
                        ? 'bg-[#01d676] text-black'
                        : isCurrent
                          ? 'bg-[#01d676]/20 text-[#01d676] border border-[#01d676]'
                          : 'bg-[#2f3043] text-[#787ead]'
                    }`}
                  >
                    {dayNum}
                  </div>
                </div>
              );
            })}
          </div>

          {!claimed && (
            <button
              onClick={claimBonus}
              disabled={claiming}
              className="px-4 py-2 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black text-sm font-bold transition disabled:opacity-50 glow-green-cta btn-hover whitespace-nowrap"
            >
              {claiming ? '...' : `Claim ${formatCurrency(bonusCents)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
