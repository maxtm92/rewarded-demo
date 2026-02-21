import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import PageTransition from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';

export const dynamic = 'force-dynamic';

const categoryGradients: Record<string, string> = {
  auto_insurance: 'bg-gradient-to-br from-blue-500/25 via-blue-900/20 to-[#141523]',
  credit_card: 'bg-gradient-to-br from-amber-500/25 via-amber-900/20 to-[#141523]',
  home_security: 'bg-gradient-to-br from-emerald-500/25 via-emerald-900/20 to-[#141523]',
  education: 'bg-gradient-to-br from-purple-500/25 via-purple-900/20 to-[#141523]',
  gaming: 'bg-gradient-to-br from-pink-500/25 via-pink-900/20 to-[#141523]',
  finance: 'bg-gradient-to-br from-cyan-500/25 via-cyan-900/20 to-[#141523]',
};

const defaultGradient = 'bg-gradient-to-br from-[#393e56]/50 via-[#2f3043] to-[#141523]';

export default async function OffersPage() {
  const offers = await prisma.premiumOffer.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  const angles = await prisma.marketingAngle.findMany({
    where: { isActive: true },
  });

  function selectAngle() {
    if (angles.length === 0) return null;
    const totalWeight = angles.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.random() * totalWeight;
    for (const angle of angles) {
      random -= angle.weight;
      if (random <= 0) return angle;
    }
    return angles[0];
  }

  const totalEarnings = offers.reduce((sum, o) => sum + o.payoutCents, 0);

  return (
    <PageTransition>
      {/* Header with stats */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Premium Offers</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[#a9a9ca]">
            {offers.length} offer{offers.length !== 1 ? 's' : ''} available
          </span>
          <span className="w-1 h-1 rounded-full bg-[#393e56]" />
          <span className="text-[#fac401] font-medium">
            {formatCurrency(totalEarnings)} to earn
          </span>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-shadow">
          <span className="text-5xl mb-4 block">🔥</span>
          <p className="text-[#a9a9ca]">Premium offers coming soon!</p>
        </div>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const angle = offer.angleId ? angles.find((a) => a.id === offer.angleId) : selectAngle();
            const gradient = categoryGradients[offer.category] || defaultGradient;

            return (
              <StaggerItem key={offer.id}>
                <Link
                  href={`/offers/${offer.slug}`}
                  className="block rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#fac401]/40 overflow-hidden transition group card-inset hover-lift"
                >
                  {/* Image area */}
                  <div className="relative h-44 overflow-hidden">
                    {offer.imageUrl ? (
                      <img
                        src={offer.imageUrl}
                        alt={offer.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full ${gradient}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d2e] via-transparent to-transparent" />

                    {/* Payout badge — top right */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-[#fac401] text-black font-bold text-sm shadow-lg">
                      {formatCurrency(offer.payoutCents)}
                    </div>

                    {/* Category tag — bottom left */}
                    <div className="absolute bottom-3 left-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#1d1d2e]/80 backdrop-blur-sm text-[#a9a9ca] text-xs font-medium capitalize">
                        {offer.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#fac401]/10 flex items-center justify-center text-xl flex-shrink-0 icon-bounce">
                        {offer.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-white text-base truncate">
                          {angle?.headline || offer.headline}
                        </h2>
                        <p className="text-[#a9a9ca] text-sm line-clamp-2 mt-0.5">
                          {angle?.subheadline || offer.description}
                        </p>
                      </div>
                    </div>

                    <div className="w-full py-3 rounded-xl bg-[#fac401] text-black font-semibold text-sm text-center transition group-hover:bg-[#ffbc11] glow-gold-cta btn-hover">
                      {angle?.ctaText || 'Claim Offer'} — Earn {formatCurrency(offer.payoutCents)}
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerList>
      )}
    </PageTransition>
  );
}
