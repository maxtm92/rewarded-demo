import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import PageTransition from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';
import ActivityFeed from '@/components/earn/ActivityFeed';
import LeaderboardPreview from '@/components/earn/LeaderboardPreview';
import FeaturedWallCard from '@/components/earn/cards/FeaturedWallCard';
import WallCard from '@/components/earn/cards/WallCard';
import PhoneOptIn from '@/components/PhoneOptIn';

export const dynamic = 'force-dynamic';

export default async function EarnPage() {
  const session = await auth();
  const [walls, user] = await Promise.all([
    prisma.offerWall.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { lifetimeCents: true, phoneOptInBonus: true },
        })
      : Promise.resolve(null),
  ]);

  const featuredWall = walls.find(w => w.isFeatured) || null;
  const otherWalls = walls.filter(w => !w.isFeatured);

  // Preview items for hero strip
  const previewItems = walls.map(w => ({
    name: w.name,
    icon: w.icon,
    logoUrl: w.logoUrl,
    description: w.bonusDetail || 'Complete offers to earn $10',
    payout: w.bonusText || '$10',
    href: `/earn/${w.slug}`,
  }));

  return (
    <PageTransition>
      {/* ── Hero Banner ── */}
      <div className="earn-hero relative rounded-[20px] overflow-hidden mb-8">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2301d676' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 p-6 md:p-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
            Earn <span className="text-[#01d676] text-glow-green">$10</span> per completed offer
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2f3043]/80 border border-[#393e56] text-sm">
              <span className="text-base">🚀</span>
              <span className="text-white font-bold">17 min</span>
              <span className="text-[#787ead]">first reward</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2f3043]/80 border border-[#393e56] text-sm">
              <span className="text-[#01d676] font-bold">$500K+</span>
              <span className="text-[#787ead]">paid out</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2f3043]/80 border border-[#393e56] text-sm">
              <span className="text-[#fac401] font-bold">50K+</span>
              <span className="text-[#787ead]">users</span>
            </span>
          </div>

          {/* Offer preview strip */}
          {previewItems.length > 0 && (
            <div className="flex gap-3 mt-1 mb-5 overflow-x-auto pb-1 scrollbar-hide md:overflow-visible">
              {previewItems.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#141523]/60 border border-[#393e56]/50 hover:border-[#01d676]/30 transition-all flex-1 min-w-[200px] group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#2f3043] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.name} className="w-8 h-8 object-contain rounded-lg" />
                    ) : (
                      <span className="text-xl">{item.icon}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                    <p className="text-[#787ead] text-xs truncate">{item.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-base">{item.payout}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <a
              href="#earn-offers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-bold text-sm transition glow-green-cta btn-hover"
            >
              Start Earning →
            </a>
            <span className="text-[#a9a9ca] text-sm">
              <span className="text-[#01d676] font-bold">{walls.length}</span> offers available
            </span>
          </div>
        </div>
      </div>

      {/* ── Phone Opt-In Banner ── */}
      {user && !user.phoneOptInBonus && (
        <div className="mb-8">
          <PhoneOptIn />
        </div>
      )}

      {/* ── Offers Section (FreeCash + Playful) ── */}
      {walls.length > 0 && (
        <section id="earn-offers" className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-purple-500" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl">🎮</div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Earn with Games</h2>
                  <span className="text-[#787ead] text-xs">{walls.length} {walls.length === 1 ? 'offer' : 'offers'}</span>
                </div>
                <p className="text-[#787ead] text-sm">Complete 1 offer to claim $10</p>
              </div>
            </div>
          </div>

          {/* Featured Wall */}
          {featuredWall && (
            <div className="mb-5">
              <FeaturedWallCard
                name={featuredWall.name}
                icon={featuredWall.icon}
                logoUrl={featuredWall.logoUrl}
                bonusText={featuredWall.bonusText}
                bonusDetail={featuredWall.bonusDetail}
                slug={featuredWall.slug}
              />
            </div>
          )}

          {/* Other offerwalls */}
          {otherWalls.length > 0 && (
            <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherWalls.map((wall) => (
                <StaggerItem key={wall.id}>
                  <WallCard
                    name={wall.name}
                    icon={wall.icon}
                    logoUrl={wall.logoUrl}
                    bonusText={wall.bonusText}
                    bonusDetail={wall.bonusDetail}
                    section="games"
                    slug={wall.slug}
                  />
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </section>
      )}

      {/* ── Activity Feed ── */}
      <div className="mb-10 md:mb-14">
        <ActivityFeed />
      </div>

      {/* ── Leaderboard Preview ── */}
      <section className="mb-10 md:mb-14">
        <LeaderboardPreview />
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
