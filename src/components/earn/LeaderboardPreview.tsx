'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface LeaderboardItem {
  rank: number;
  name: string;
  earnedCents: number;
  isCurrentUser: boolean;
}

export default function LeaderboardPreview() {
  const [entries, setEntries] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard?period=weekly')
      .then(r => r.json())
      .then(data => setEntries(data.leaderboard?.slice(0, 3) ?? []))
      .catch(() => {});
  }, []);

  if (entries.length === 0) return null;

  const rankIcons = ['🥇', '🥈', '🥉'];

  return (
    <div className="rounded-2xl bg-[#1d1d2e] border border-[#393e56] p-5 card-inset">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h3 className="text-white font-bold text-sm">Weekly Leaderboard</h3>
        </div>
        <Link href="/leaderboard" className="text-[#01d676] text-xs font-semibold hover:underline">
          View All
        </Link>
      </div>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-3 py-2 rounded-xl ${
              entry.isCurrentUser ? 'bg-[#01d676]/10 border border-[#01d676]/20' : 'bg-[#2f3043]/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{rankIcons[i] ?? `#${entry.rank}`}</span>
              <span className={`text-sm font-medium ${entry.isCurrentUser ? 'text-[#01d676]' : 'text-white'}`}>
                {entry.name}
              </span>
            </div>
            <span className="text-[#01d676] text-sm font-bold">{formatCurrency(entry.earnedCents)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
