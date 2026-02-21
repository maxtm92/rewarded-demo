'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import PageTransition from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferred: number;
  totalEarnedCents: number;
  referrals: { name: string; joinedAt: string; earnedCents: number }[];
}

const milestones = [
  { name: 'First Referral', target: 1, icon: '🌱' },
  { name: 'Team Builder', target: 5, icon: '🤝' },
  { name: 'Influencer', target: 10, icon: '⭐' },
  { name: 'Ambassador', target: 25, icon: '👑' },
];

export default function ReferralPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  function copyLink() {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  function shareUrl(platform: string) {
    if (!data?.referralLink) return;
    const text = `Join Easy Task Cash and earn real cash! Use my link:`;
    const encoded = encodeURIComponent(data.referralLink);
    const textEncoded = encodeURIComponent(text);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${textEncoded}&url=${encoded}`,
      whatsapp: `https://wa.me/?text=${textEncoded}%20${encoded}`,
      email: `mailto:?subject=${encodeURIComponent('Earn cash with Easy Task Cash')}&body=${textEncoded}%20${encoded}`,
    };

    window.open(urls[platform], '_blank');
  }

  if (!session?.user) return null;

  const totalReferred = data?.totalReferred ?? 0;

  // Find current and next milestone
  const currentMilestone = [...milestones].reverse().find(m => totalReferred >= m.target);
  const nextMilestone = milestones.find(m => totalReferred < m.target);
  const progressToNext = nextMilestone
    ? Math.min(100, (totalReferred / nextMilestone.target) * 100)
    : 100;

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">

        {/* Hero Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/15 via-[#1d1d2e] to-blue-500/10 border border-purple-500/20 relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤝</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Refer & Earn</h1>
            </div>
            <p className="text-[#a9a9ca] text-sm md:text-base mb-5">
              Earn <span className="text-[#01d676] font-bold">10%</span> of everything your friends earn. Forever. No limits.
            </p>

            {/* Stats pills */}
            <div className="flex gap-3">
              <div className="px-4 py-2 rounded-full bg-[#01d676]/10 border border-[#01d676]/20">
                <span className="text-[#01d676] text-sm font-bold">{formatCurrency(data?.totalEarnedCents ?? 0)}</span>
                <span className="text-[#787ead] text-xs ml-1.5">earned</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <span className="text-white text-sm font-bold">{totalReferred}</span>
                <span className="text-[#787ead] text-xs ml-1.5">friends invited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Referral link */}
        <div className="p-6 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset mb-6">
          <p className="text-white font-semibold text-sm mb-3">Your Referral Link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={data?.referralLink ?? '...'}
              className="flex-1 px-4 py-3 rounded-xl bg-[#2f3043] border border-[#393e56] text-white text-sm font-mono truncate"
            />
            <button
              onClick={copyLink}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition btn-hover min-w-[80px] ${
                copied
                  ? 'bg-[#01d676]/20 text-[#01d676] border border-[#01d676]/30'
                  : 'bg-[#01d676] hover:bg-[#01ff97] text-black glow-green-cta'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-2 mt-4">
            <button onClick={() => shareUrl('twitter')} className="flex-1 py-2.5 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] text-sm font-medium transition border border-[#1DA1F2]/20">
              Twitter
            </button>
            <button onClick={() => shareUrl('whatsapp')} className="flex-1 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm font-medium transition border border-[#25D366]/20">
              WhatsApp
            </button>
            <button onClick={() => shareUrl('email')} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition border border-white/10">
              Email
            </button>
          </div>
        </div>

        {/* Earnings Projection */}
        <div className="p-6 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">💡</span>
            <p className="text-white font-semibold text-sm">Your Earning Potential</p>
          </div>
          <p className="text-[#a9a9ca] text-sm mb-4">
            If you refer <span className="text-white font-medium">5 friends</span> who each earn <span className="text-white font-medium">$50/week</span>, you&apos;d earn:
          </p>
          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-xl bg-[#01d676]/10 border border-[#01d676]/20 text-center">
              <p className="text-[#01d676] text-lg font-bold">$25</p>
              <p className="text-[#787ead] text-[10px]">per week</p>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-[#01d676]/10 border border-[#01d676]/20 text-center">
              <p className="text-[#01d676] text-lg font-bold">$100</p>
              <p className="text-[#787ead] text-[10px]">per month</p>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-[#01d676]/10 border border-[#01d676]/20 text-center">
              <p className="text-[#01d676] text-lg font-bold">$1,200</p>
              <p className="text-[#787ead] text-[10px]">per year</p>
            </div>
          </div>
        </div>

        {/* Milestone Tiers */}
        <div className="p-6 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🎯</span>
            <p className="text-white font-semibold text-sm">Referral Milestones</p>
          </div>
          <div className="space-y-3 mb-4">
            {milestones.map(m => {
              const reached = totalReferred >= m.target;
              return (
                <div key={m.name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    reached ? 'bg-[#01d676]/20' : 'bg-[#2f3043]'
                  }`}>
                    {reached ? <span className="text-[#01d676] text-xs font-bold">✓</span> : <span className="text-[11px]">{m.icon}</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${reached ? 'text-white' : 'text-[#787ead]'}`}>{m.name}</p>
                  </div>
                  <span className={`text-xs ${reached ? 'text-[#01d676]' : 'text-[#787ead]'}`}>
                    {m.target} friend{m.target > 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          {nextMilestone && (
            <div>
              <div className="flex justify-between text-[10px] text-[#787ead] mb-1.5">
                <span>{totalReferred}/{nextMilestone.target} to {nextMilestone.name}</span>
                <span>{Math.round(progressToNext)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#2f3043] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#01d676] to-[#01ff97] transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
          )}
          {!nextMilestone && (
            <p className="text-[#01d676] text-xs font-semibold text-center">All milestones reached! 🎉</p>
          )}
        </div>

        {/* How it works */}
        <div className="p-6 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-inset mb-6">
          <p className="text-white font-semibold text-sm mb-4">How It Works</p>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-3.5 top-4 bottom-4 w-px bg-[#393e56]" />
            <div className="space-y-4">
              {[
                { step: '1', text: 'Share your unique referral link with friends' },
                { step: '2', text: 'They sign up and start completing offers' },
                { step: '3', text: 'You earn 10% of their earnings automatically' },
              ].map(item => (
                <div key={item.step} className="flex items-center gap-3 relative">
                  <div className="w-7 h-7 rounded-full bg-[#01d676]/15 border border-[#01d676]/30 flex items-center justify-center text-[#01d676] text-xs font-bold flex-shrink-0 z-10">
                    {item.step}
                  </div>
                  <p className="text-[#a9a9ca] text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Referred users */}
        {data?.referrals && data.referrals.length > 0 ? (
          <div className="rounded-2xl bg-[#1d1d2e] border border-[#393e56] overflow-hidden card-shadow">
            <div className="p-4 border-b border-[#393e56]">
              <p className="text-white font-semibold text-sm">Your Referrals</p>
            </div>
            {data.referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-[#393e56]/50 last:border-0 row-hover">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2f3043] flex items-center justify-center text-xs font-bold text-[#01d676]">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{r.name}</p>
                    <p className="text-[#787ead] text-xs">
                      {new Date(r.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className="text-[#01d676] text-sm font-semibold">{formatCurrency(r.earnedCents)}</span>
              </div>
            ))}
            {/* Total */}
            <div className="p-4 bg-[#252539] flex items-center justify-between">
              <p className="text-[#787ead] text-sm">Total from {data.referrals.length} referral{data.referrals.length > 1 ? 's' : ''}</p>
              <span className="text-[#01d676] text-sm font-bold">{formatCurrency(data.totalEarnedCents)}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#1d1d2e] border border-[#393e56] p-8 text-center card-shadow">
            <span className="text-3xl block mb-3">🔗</span>
            <p className="text-[#a9a9ca] text-sm">Share your link above to start earning passive income!</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
