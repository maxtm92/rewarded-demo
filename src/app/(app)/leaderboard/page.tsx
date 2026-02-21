'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import PageTransition from '@/components/animations/PageTransition';

interface LeaderboardItem {
  rank: number;
  name: string;
  earnedCents: number;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [entries, setEntries] = useState<LeaderboardItem[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<{ rank: number; earnedCents: number } | null>(null);

  useEffect(() => {
    fetch(`/api/leaderboard?period=${period}`)
      .then(r => r.json())
      .then(data => {
        setEntries(data.leaderboard ?? []);
        setCurrentUserRank(data.currentUserRank);
      })
      .catch(() => {});
  }, [period]);

  const rankStyles = [
    'from-[#fac401]/20 to-[#fac401]/5 border-[#fac401]/30',  // Gold
    'from-[#C0C0C0]/20 to-[#C0C0C0]/5 border-[#C0C0C0]/30',  // Silver
    'from-[#CD7F32]/20 to-[#CD7F32]/5 border-[#CD7F32]/30',  // Bronze
  ];

  const rankIcons = ['🥇', '🥈', '🥉'];

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Leaderboard</h1>
        <p className="text-[#a9a9ca] text-sm mb-6">
          Top earners win bonus rewards! Top 3 earn a <span className="text-[#fac401] font-bold">$10 bonus</span>.
        </p>

        {/* Period toggle */}
        <div className="flex gap-2 mb-6">
          {(['weekly', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                period === p
                  ? 'bg-[#01d676]/10 text-[#01d676] border border-[#01d676]/30'
                  : 'bg-[#2f3043] text-[#787ead] border border-[#393e56] hover:text-white'
              }`}
            >
              {p === 'weekly' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        {/* Top 3 */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {entries.slice(0, 3).map((entry, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl bg-gradient-to-b ${rankStyles[i]} border text-center ${
                  entry.isCurrentUser ? 'ring-2 ring-[#01d676]/50' : ''
                }`}
              >
                <span className="text-2xl block mb-1">{rankIcons[i]}</span>
                <p className="text-white font-bold text-sm truncate">{entry.name}</p>
                <p className="text-[#01d676] font-extrabold text-lg">{formatCurrency(entry.earnedCents)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Remaining list */}
        {entries.length > 3 && (
          <div className="rounded-2xl bg-[#1d1d2e] border border-[#393e56] overflow-hidden mb-6">
            {entries.slice(3).map(entry => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-4 border-b border-[#393e56]/50 last:border-0 row-hover ${
                  entry.isCurrentUser ? 'bg-[#01d676]/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#787ead] text-sm font-mono w-6">#{entry.rank}</span>
                  <span className={`text-sm font-medium ${entry.isCurrentUser ? 'text-[#01d676]' : 'text-white'}`}>
                    {entry.name} {entry.isCurrentUser && '(You)'}
                  </span>
                </div>
                <span className="text-[#01d676] text-sm font-bold">{formatCurrency(entry.earnedCents)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Current user rank (if not in top 25) */}
        {currentUserRank && !entries.some(e => e.isCurrentUser) && (
          <div className="p-4 rounded-2xl bg-[#01d676]/5 border border-[#01d676]/20">
            <p className="text-[#01d676] text-sm font-medium">
              Your Rank: <span className="font-bold">#{currentUserRank.rank}</span> — {formatCurrency(currentUserRank.earnedCents)} earned
            </p>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-[#1d1d2e] border border-[#393e56]">
            <span className="text-4xl mb-3 block">🏆</span>
            <p className="text-[#a9a9ca]">No entries yet. Start earning to climb the leaderboard!</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
