'use client';

import { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export default function AchievementGrid() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [counts, setCounts] = useState({ unlocked: 0, total: 0 });

  useEffect(() => {
    fetch('/api/achievements')
      .then(r => r.json())
      .then(data => {
        setAchievements(data.achievements ?? []);
        setCounts({ unlocked: data.unlockedCount ?? 0, total: data.totalCount ?? 0 });
      })
      .catch(() => {});
  }, []);

  if (achievements.length === 0) return null;

  return (
    <div className="p-8 rounded-[20px] bg-[#1d1d2e] border border-[#393e56] card-inset">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Badges</h2>
        <span className="text-sm text-[#01d676] font-semibold">{counts.unlocked}/{counts.total}</span>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-7 gap-3">
        {achievements.map(a => (
          <div
            key={a.id}
            className="group relative flex flex-col items-center gap-1"
            title={`${a.name}: ${a.description}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
              a.unlocked
                ? 'bg-[#2f3043] border border-[#01d676]/30 shadow-[0_0_10px_rgba(1,214,118,0.15)]'
                : 'bg-[#2f3043]/50 border border-[#393e56] grayscale opacity-40'
            }`}>
              {a.icon}
            </div>
            <span className={`text-[9px] font-medium text-center leading-tight ${
              a.unlocked ? 'text-white' : 'text-[#787ead]'
            }`}>
              {a.name}
            </span>
            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
              <div className="bg-[#2f3043] border border-[#393e56] rounded-lg px-3 py-2 text-[11px] text-white whitespace-nowrap shadow-lg">
                <p className="font-bold">{a.name}</p>
                <p className="text-[#787ead]">{a.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
