import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import OfferCTA from '@/components/earn/OfferCTA';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PremiumOfferPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) return notFound();

  const offer = await prisma.premiumOffer.findUnique({
    where: { slug },
  });

  if (!offer || !offer.isActive) return notFound();

  // Get marketing angle if linked
  let angle = null;
  if (offer.angleId) {
    angle = await prisma.marketingAngle.findUnique({
      where: { id: offer.angleId },
    });
    // Track impression
    if (angle) {
      await prisma.marketingAngle.update({
        where: { id: angle.id },
        data: { impressions: { increment: 1 } },
      });
    }
  }

  // Check if already completed
  const completion = await prisma.premiumOfferCompletion.findUnique({
    where: { userId_offerId: { userId: session.user.id, offerId: offer.id } },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-amber-500/20 to-amber-600/5 flex items-center justify-center text-4xl mx-auto mb-4">
          {offer.icon}
        </div>
        <h1 className="text-2xl font-bold mb-2">{angle?.headline || offer.headline}</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          {angle?.description || offer.description}
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#151929] border border-white/5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400">Reward</span>
          <span className="text-2xl font-bold text-amber-400 text-glow-gold">
            {formatCurrency(offer.payoutCents)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400">Category</span>
          <span className="text-sm font-medium capitalize">{offer.category.replace('_', ' ')}</span>
        </div>
        {offer.advertiserName && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">By</span>
            <span className="text-sm font-medium">{offer.advertiserName}</span>
          </div>
        )}
      </div>

      {completion ? (
        <div className="text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-3xl mb-2 block">✅</span>
          <p className="font-semibold text-emerald-400">You&apos;ve already completed this offer</p>
          <p className="text-gray-400 text-sm mt-1">Earned: {formatCurrency(completion.earnedCents)}</p>
        </div>
      ) : (
        <OfferCTA
          offerId={offer.id}
          externalUrl={offer.externalUrl}
          ctaText={angle?.ctaText || 'Complete Offer'}
          angleId={angle?.id}
        />
      )}
    </div>
  );
}
