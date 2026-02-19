import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OffersPage() {
  const offers = await prisma.premiumOffer.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  // Load marketing angles for weighted selection
  const angles = await prisma.marketingAngle.findMany({
    where: { isActive: true },
  });

  // Weighted random angle selector
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Premium Offers</h1>
        <p className="text-gray-400">High-payout offers — earn $10-$50+ each</p>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🔥</span>
          <p className="text-gray-400">Premium offers coming soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => {
            const angle = offer.angleId ? angles.find((a) => a.id === offer.angleId) : selectAngle();
            return (
              <Link
                key={offer.id}
                href={`/offers/${offer.slug}`}
                className="block p-6 rounded-2xl bg-gradient-to-b from-amber-500/5 to-transparent border border-amber-500/10 hover:border-amber-500/30 transition group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-600/5 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {offer.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold">{angle?.headline || offer.headline}</h2>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {angle?.subheadline || offer.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-semibold">
                      {formatCurrency(offer.payoutCents)}
                    </span>
                    <span className="text-gray-500 text-xs">{offer.category.replace('_', ' ')}</span>
                  </div>
                  <span className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 font-semibold text-sm transition">
                    {angle?.ctaText || 'Claim Offer'} →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
