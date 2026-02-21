import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import PageTransition from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';
import StreakBanner from '@/components/earn/StreakBanner';
import ActivityFeed from '@/components/earn/ActivityFeed';
import ReferralBanner from '@/components/earn/ReferralBanner';
import LeaderboardPreview from '@/components/earn/LeaderboardPreview';

export const dynamic = 'force-dynamic';

/* ── Offerwall config (bonus amounts + categories) ── */
const wallConfig: Record<string, { bonus: string; detail: string; section: 'games' | 'surveys' }> = {
  freecash:       { bonus: '$10', detail: 'Must complete one game to claim', section: 'games' },
  playful:        { bonus: '$5',  detail: 'Must complete one game to claim', section: 'games' },
  tester:         { bonus: '$5',  detail: 'Must complete one game to claim', section: 'games' },
  'fluent-surveys': { bonus: '$5', detail: 'Complete an offer to claim', section: 'surveys' },
};

const defaultConfig = { bonus: '$5', detail: 'Complete an offer to claim', section: 'games' as const };

export default async function EarnPage() {
  const session = await auth();
  const [walls, premiumOffers, user] = await Promise.all([
    prisma.offerWall.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.premiumOffer.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { lifetimeCents: true },
        })
      : Promise.resolve(null),
  ]);

  const ADVANCED_THRESHOLD = 2000;
  const lifetimeCents = user?.lifetimeCents ?? 0;
  const isUnlocked = lifetimeCents >= ADVANCED_THRESHOLD;
  const progressPct = Math.min(Math.round((lifetimeCents / ADVANCED_THRESHOLD) * 100), 100);

  const allGameWalls = walls.filter(w => (wallConfig[w.slug] || defaultConfig).section === 'games');
  const featuredWall = allGameWalls.find(w => w.slug === 'freecash');
  const gameWalls = allGameWalls.filter(w => w.slug !== 'freecash');
  const surveyWalls = walls.filter(w => (wallConfig[w.slug] || defaultConfig).section === 'surveys');
  const insuranceOffers = premiumOffers.filter(o => o.category === 'auto_insurance');
  const saveOffers = premiumOffers.filter(o => o.category !== 'auto_insurance');

  const totalItems = walls.length + premiumOffers.length;

  return (
    <PageTransition>
      {/* ═══════════════════════════════════════════════ */}
      {/* ── Hero Banner ── */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="earn-hero relative rounded-[20px] overflow-hidden mb-8">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2301d676' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 p-8 md:p-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            <span className="text-[#01d676] text-glow-green">Get paid</span> for testing apps,
            <br className="hidden lg:block" />
            {' '}games & surveys
          </h1>

          {/* Inline stat pills */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2f3043]/80 border border-[#393e56] text-sm">
              <span className="text-base">🚀</span>
              <span className="text-white font-bold">17m</span>
              <span className="text-[#787ead]">avg first reward</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2f3043]/80 border border-[#393e56] text-sm">
              <span className="text-base">🔥</span>
              <span className="text-white font-bold">$32</span>
              <span className="text-[#787ead]">avg earned/day</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2f3043]/80 border border-[#393e56] text-sm">
              <span className="text-[#01d676] font-bold">$500K+</span>
              <span className="text-[#787ead]">paid out</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <a
              href="#earn-games"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-bold text-sm transition glow-green-cta btn-hover"
            >
              Start Earning →
            </a>
            <span className="text-[#a9a9ca] text-sm">
              <span className="text-[#01d676] font-bold">{totalItems}</span> ways to earn now
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* ── Engagement Strip ── */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="space-y-2 mb-10 md:mb-14">
        {/* Streak + Referral row */}
        <div className="rounded-2xl bg-[#1d1d2e] border border-[#393e56] px-4 py-3 card-inset">
          <div className="flex items-center justify-between gap-3">
            <StreakBanner compact />
            <div className="hidden md:block border-l border-[#393e56] h-6 mx-1" />
            <div className="hidden md:block">
              <ReferralBanner inline />
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <ActivityFeed />
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* ── SECTION: Earn with Games ── */}
      {/* ═══════════════════════════════════════════════ */}
      {(featuredWall || gameWalls.length > 0) && (
        <section id="earn-games" className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-purple-500" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl">🎮</div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Earn with Games</h2>
                  <span className="text-[#787ead] text-xs">{allGameWalls.length} {allGameWalls.length === 1 ? 'offer' : 'offers'}</span>
                </div>
                <p className="text-[#787ead] text-sm">Download & play games to earn cash</p>
              </div>
            </div>
          </div>

          {/* Featured: Freecash */}
          {featuredWall && (() => {
            const config = wallConfig[featuredWall.slug] || defaultConfig;
            return (
              <Link
                href={`/earn/${featuredWall.slug}`}
                className="earn-card block rounded-[20px] bg-[#1d1d2e] border border-[#01d676]/30 overflow-hidden transition-all duration-300 group shadow-[0_0_30px_rgba(1,214,118,0.12)] hover:shadow-[0_0_50px_rgba(1,214,118,0.25)] hover:border-[#01d676]/60 mb-5"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-64 h-44 md:h-auto bg-gradient-to-br from-[#01d676]/30 via-[#0a2e1f] to-[#141523] flex-shrink-0">
                    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5" />
                    <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {featuredWall.logoUrl ? (
                        <div className="w-24 h-24 rounded-2xl bg-[#1d1d2e]/60 backdrop-blur-md border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500">
                          <img src={featuredWall.logoUrl} alt={featuredWall.name} className="w-full h-full object-contain rounded-xl" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-[#1d1d2e]/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                          {featuredWall.icon}
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
                      {featuredWall.name}
                    </h3>

                    <p className="text-[#a9a9ca] text-sm mb-1">
                      Earn <span className="text-white font-bold">$5 — $2,500</span> per offer — get <span className="text-[#01d676] font-bold">{config.bonus} bonus</span> from Easy Task Cash
                    </p>
                    <p className="text-[#787ead] text-xs mb-5">250+ offers available · {config.detail}</p>

                    <div className="flex items-center gap-4">
                      <div className="px-8 py-3 rounded-xl bg-[#01d676] text-black font-bold text-sm text-center transition-all group-hover:bg-[#01ff97] glow-green-cta btn-hover">
                        Download & Earn {config.bonus} →
                      </div>
                      <div className="flex items-center gap-1 text-[#fac401] text-sm">
                        <span>★★★★★</span>
                        <span className="text-[#787ead] text-xs ml-1">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })()}

          {/* Other game offerwalls — horizontal compact cards */}
          {gameWalls.length > 0 && (
            <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameWalls.map((wall) => {
                const config = wallConfig[wall.slug] || defaultConfig;
                return (
                  <StaggerItem key={wall.id}>
                    <Link
                      href={`/earn/${wall.slug}`}
                      className="earn-card block rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#01d676]/40 overflow-hidden transition-all duration-300 group hover:shadow-[0_0_20px_rgba(1,214,118,0.08)]"
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366f1]/30 to-[#1e1b4b] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          {wall.logoUrl ? (
                            <img src={wall.logoUrl} alt={wall.name} className="w-10 h-10 object-contain rounded-lg" />
                          ) : (
                            <span className="text-2xl">{wall.icon}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <h3 className="text-base font-bold text-white group-hover:text-[#01d676] transition-colors truncate">
                              {wall.name}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#fac401] text-black font-bold text-xs flex-shrink-0">
                              {config.bonus}
                            </span>
                          </div>
                          <p className="text-[#787ead] text-xs mb-2.5">{config.detail}</p>
                          <div className="w-full py-2 rounded-lg bg-[#2f3043] text-white font-bold text-xs text-center transition-all group-hover:bg-[#3a3b55] border border-[#393e56]">
                            Download & Earn {config.bonus} →
                          </div>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerList>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* ── SECTION: Earn with Surveys ── */}
      {/* ═══════════════════════════════════════════════ */}
      {surveyWalls.length > 0 && (
        <section className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-cyan-500" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl">📋</div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Earn with Surveys</h2>
                  <span className="text-[#787ead] text-xs">{surveyWalls.length} {surveyWalls.length === 1 ? 'offer' : 'offers'}</span>
                </div>
                <p className="text-[#787ead] text-sm">Share your opinion and get paid</p>
              </div>
            </div>
          </div>

          <StaggerList className={`grid gap-4 ${surveyWalls.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {surveyWalls.map((wall) => {
              const config = wallConfig[wall.slug] || defaultConfig;
              const isSingle = surveyWalls.length === 1;

              if (isSingle) {
                return (
                  <StaggerItem key={wall.id}>
                    <Link
                      href={`/earn/${wall.slug}`}
                      className="earn-card block rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#01d676]/40 overflow-hidden transition-all duration-300 group hover:shadow-[0_0_20px_rgba(1,214,118,0.1)]"
                    >
                      <div className="flex items-center gap-5 p-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06b6d4]/30 to-[#083344] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          {wall.logoUrl ? (
                            <img src={wall.logoUrl} alt={wall.name} className="w-12 h-12 object-contain rounded-xl" />
                          ) : (
                            <span className="text-3xl">{wall.icon}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <h3 className="text-lg font-bold text-white group-hover:text-[#01d676] transition-colors">
                              {wall.name}
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-[#01d676] text-black font-bold text-sm flex-shrink-0">
                              {config.bonus}
                            </span>
                          </div>
                          <p className="text-[#787ead] text-xs mb-3">{config.detail}</p>
                          <div className="w-full md:w-auto md:inline-block px-6 py-2.5 rounded-xl bg-[#01d676] text-black font-bold text-sm text-center transition-all group-hover:bg-[#01ff97] glow-green-cta">
                            Start Surveys & Earn {config.bonus} →
                          </div>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              }

              return (
                <StaggerItem key={wall.id}>
                  <Link
                    href={`/earn/${wall.slug}`}
                    className="earn-card block rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#01d676]/40 overflow-hidden transition-all duration-300 group hover:shadow-[0_0_20px_rgba(1,214,118,0.08)]"
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06b6d4]/30 to-[#083344] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        {wall.logoUrl ? (
                          <img src={wall.logoUrl} alt={wall.name} className="w-10 h-10 object-contain rounded-lg" />
                        ) : (
                          <span className="text-2xl">{wall.icon}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h3 className="text-base font-bold text-white group-hover:text-[#01d676] transition-colors truncate">
                            {wall.name}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#01d676] text-black font-bold text-xs flex-shrink-0">
                            {config.bonus}
                          </span>
                        </div>
                        <p className="text-[#787ead] text-xs mb-2.5">{config.detail}</p>
                        <div className="w-full py-2 rounded-lg bg-[#01d676] text-black font-bold text-xs text-center transition-all group-hover:bg-[#01ff97] glow-green-cta">
                          Start Surveys & Earn {config.bonus} →
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </section>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* ── SECTION: Save ── */}
      {/* ═══════════════════════════════════════════════ */}
      {saveOffers.length > 0 && (
        <section className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-amber-500" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl">💰</div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Save</h2>
                  <span className="text-[#787ead] text-xs">{saveOffers.length} {saveOffers.length === 1 ? 'offer' : 'offers'}</span>
                </div>
                <p className="text-[#787ead] text-sm">Compare rates and earn rewards</p>
              </div>
            </div>
          </div>

          <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saveOffers.map((offer) => (
              <StaggerItem key={offer.id}>
                <Link
                  href={`/offers/${offer.slug}`}
                  className="earn-card block rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#fac401]/40 overflow-hidden transition-all duration-300 group hover:shadow-[0_0_20px_rgba(250,196,1,0.08)]"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f59e0b]/30 to-[#451a03] flex items-center justify-center flex-shrink-0 text-2xl group-hover:scale-105 transition-transform">
                      {offer.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 className="text-base font-bold text-white group-hover:text-[#fac401] transition-colors truncate">
                          {offer.headline || offer.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#fac401] text-black font-bold text-xs flex-shrink-0">
                          {formatCurrency(offer.payoutCents)}
                        </span>
                      </div>
                      <p className="text-[#787ead] text-xs mb-2.5 line-clamp-1">{offer.description}</p>
                      <div className="w-full py-2 rounded-lg bg-[#fac401] text-black font-bold text-xs text-center transition-all group-hover:bg-[#ffbc11] glow-gold-cta">
                        Claim Offer — Earn {formatCurrency(offer.payoutCents)}
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        </section>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* ── SECTION: Auto Insurance ── */}
      {/* ═══════════════════════════════════════════════ */}
      {insuranceOffers.length > 0 && (
        <section className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-blue-500" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">🚗</div>
              <div>
                <h2 className="text-xl font-bold text-white">Auto Insurance</h2>
                <p className="text-[#787ead] text-sm">Get paid to compare rates</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-w-lg">
            {insuranceOffers.map((offer) => (
              <Link
                key={offer.id}
                href={`/offers/${offer.slug}`}
                className="earn-card block rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#01d676]/40 overflow-hidden transition-all duration-300 group hover:shadow-[0_0_20px_rgba(1,214,118,0.08)]"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    🚗
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-base font-bold text-white group-hover:text-[#01d676] transition-colors">
                        Get paid $2 to compare rates
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#01d676] text-black font-bold text-xs flex-shrink-0">
                        $2
                      </span>
                    </div>
                    <p className="text-[#787ead] text-xs">Complete an auto insurance form in under 2 minutes</p>
                  </div>
                  <div className="flex-shrink-0 text-[#787ead] group-hover:text-[#01d676] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* ── Leaderboard Preview ── */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="mb-10 md:mb-14">
        <LeaderboardPreview />
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ── Unlock Advanced Mode ── */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="mb-10 md:mb-14">
        <div className="rounded-[20px] bg-gradient-to-br from-[#1d1d2e] to-[#1a1b2e] border border-[#393e56] p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-extrabold text-white mb-1">
                {isUnlocked
                  ? 'Advanced Mode Unlocked!'
                  : <>Complete the bar to unlock<br />advanced mode</>
                }
              </h2>
              <p className="text-[#787ead] text-sm mt-4 mb-2 font-semibold">
                {isUnlocked ? 'Advanced mode active' : 'Unlock advanced version'}
              </p>
              <div className="relative h-10 rounded-full bg-[#2f3043] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#01d676] to-[#01d676]/80 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPct, 2)}%` }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-2xl">{isUnlocked ? '✅' : '🔗'}</span>
                </div>
              </div>
              <p className="mt-2">
                <span className="text-[#fac401] font-bold">{formatCurrency(lifetimeCents)}</span>
                <span className="text-[#787ead]"> / </span>
                <span className="text-[#fac401] font-bold">$20.00</span>
              </p>
            </div>

            <div className="flex-1">
              <p className="text-[#01d676] font-bold text-sm mb-4">Advanced mode includes:</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#393e56] bg-[#141523]/50">
                  <div className="w-12 h-12 rounded-xl bg-[#01d676]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#01d676]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" /><path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" /></svg>
                  </div>
                  <span className="text-white text-xs font-semibold text-center">ETC Rewards</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#393e56] bg-[#141523]/50">
                  <div className="w-12 h-12 rounded-xl bg-[#01d676]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#01d676]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                  </div>
                  <span className="text-white text-xs font-semibold text-center">Leaderboard Events</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#393e56] bg-[#141523]/50">
                  <div className="w-12 h-12 rounded-xl bg-[#01d676]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#01d676]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                  </div>
                  <span className="text-white text-xs font-semibold text-center">Premium Offers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <div className="mb-4 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-6 text-[#787ead] text-sm">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#01d676]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Secure & Verified
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#01d676]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Instant Payouts
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#01d676]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            Trusted by 50K+ Users
          </span>
        </div>
      </div>
    </PageTransition>
  );
}
