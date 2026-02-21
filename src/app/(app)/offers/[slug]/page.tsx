import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import OfferCTA from '@/components/earn/OfferCTA';
import PageTransition from '@/components/animations/PageTransition';

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

  const categoryGradients: Record<string, string> = {
    auto_insurance: 'bg-gradient-to-br from-blue-500/25 via-blue-900/20 to-[#141523]',
    credit_card: 'bg-gradient-to-br from-amber-500/25 via-amber-900/20 to-[#141523]',
    home_security: 'bg-gradient-to-br from-emerald-500/25 via-emerald-900/20 to-[#141523]',
    education: 'bg-gradient-to-br from-purple-500/25 via-purple-900/20 to-[#141523]',
    gaming: 'bg-gradient-to-br from-pink-500/25 via-pink-900/20 to-[#141523]',
    finance: 'bg-gradient-to-br from-cyan-500/25 via-cyan-900/20 to-[#141523]',
  };
  const gradient = categoryGradients[offer.category] || 'bg-gradient-to-br from-[#393e56]/50 via-[#2f3043] to-[#141523]';

  return (
    <PageTransition>
    <div className="max-w-2xl mx-auto">
      {/* Hero banner */}
      <div className="relative h-48 rounded-2xl overflow-hidden mb-8">
        {offer.imageUrl ? (
          <img src={offer.imageUrl} alt={offer.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full ${gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141523] via-[#141523]/40 to-transparent" />
        <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-[#fac401] text-black font-bold text-sm shadow-lg">
          {formatCurrency(offer.payoutCents)}
        </div>
        <div className="absolute bottom-4 left-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1d1d2e]/80 backdrop-blur-sm border border-[#393e56] flex items-center justify-center text-2xl">
            {offer.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white drop-shadow-sm">{angle?.headline || offer.headline}</h1>
            <p className="text-[#a9a9ca] text-sm">{angle?.description || offer.description}</p>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-[20px] bg-[#1d1d2e] border border-[#393e56] mb-8 card-inset">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[#787ead]">Reward</span>
          <span className="text-2xl font-bold text-[#fac401]">
            {formatCurrency(offer.payoutCents)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[#787ead]">Category</span>
          <span className="text-sm font-medium text-white capitalize">{offer.category.replace('_', ' ')}</span>
        </div>
        {offer.advertiserName && (
          <div className="flex items-center justify-between">
            <span className="text-[#787ead]">By</span>
            <span className="text-sm font-medium text-white">{offer.advertiserName}</span>
          </div>
        )}
      </div>

      {completion ? (
        <div className="text-center p-8 rounded-[20px] bg-[#01d676]/10 border border-[#01d676]/30">
          <span className="text-3xl mb-2 block">✅</span>
          <p className="font-semibold text-[#01d676]">You&apos;ve already completed this offer</p>
          <p className="text-[#a9a9ca] text-sm mt-1">Earned: {formatCurrency(completion.earnedCents)}</p>
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
    </PageTransition>
  );
}
