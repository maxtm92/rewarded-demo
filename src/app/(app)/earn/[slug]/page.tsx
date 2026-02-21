import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OfferWallEmbed from '@/components/earn/OfferWallEmbed';

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

  // Build the URL with userId as sub-parameter
  const embedUrl = wall.iframeUrl
    ? `${wall.iframeUrl}${wall.iframeUrl.includes('?') ? '&' : '?'}sub_id=${session.user.id}`
    : null;

  const redirectUrl = wall.redirectUrl
    ? `${wall.redirectUrl}${wall.redirectUrl.includes('?') ? '&' : '?'}sub_id=${session.user.id}`
    : null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{wall.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-white">{wall.name}</h1>
          <p className="text-[#a9a9ca] text-sm">{wall.description}</p>
        </div>
      </div>

      <OfferWallEmbed
        name={wall.name}
        iframeUrl={embedUrl}
        redirectUrl={redirectUrl}
      />
    </div>
  );
}
