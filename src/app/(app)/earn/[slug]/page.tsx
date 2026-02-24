import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCachedTrackingLink } from '@/lib/everflow';
import OfferWallEmbed from '@/components/earn/OfferWallEmbed';
import PageTransition from '@/components/animations/PageTransition';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OfferWallPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) return notFound();

  const wall = await prisma.offerWall.findUnique({
    where: { slug },
  });

  if (!wall || !wall.isActive) return notFound();

  // Build tracking URL via Everflow API (with fallback to manual construction)
  let redirectUrl: string | null = null;

  if (wall.everflowOfferId && process.env.EVERFLOW_API_KEY) {
    try {
      const affId = parseInt(wall.everflowAffId || process.env.EVERFLOW_AFF_ID || '1');
      redirectUrl = await getCachedTrackingLink({
        offerId: parseInt(wall.everflowOfferId),
        affiliateId: affId,
        sub1: session.user.id,
      });
    } catch (err) {
      console.error('[Everflow] Failed to generate tracking link, falling back:', err);
      const everflowDomain = process.env.EVERFLOW_DOMAIN;
      if (everflowDomain) {
        const affId = wall.everflowAffId || process.env.EVERFLOW_AFF_ID || '1';
        redirectUrl = `https://${everflowDomain}/click?oid=${wall.everflowOfferId}&affid=${affId}&sub1=${session.user.id}`;
      }
    }
  } else if (wall.redirectUrl) {
    redirectUrl = `${wall.redirectUrl}${wall.redirectUrl.includes('?') ? '&' : '?'}sub_id=${session.user.id}`;
  }

  return (
    <PageTransition>
      <div className="flex items-center gap-4 mb-8">
        <span className="text-3xl">{wall.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-white">{wall.name}</h1>
          <p className="text-[#a9a9ca] text-sm">{wall.description}</p>
        </div>
      </div>

      <OfferWallEmbed
        name={wall.name}
        slug={wall.slug}
        iframeUrl={null}
        redirectUrl={redirectUrl}
      />
    </PageTransition>
  );
}
