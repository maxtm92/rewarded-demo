import { prisma } from '@/lib/prisma';
import OfferWallsAdmin from '@/components/admin/OfferWallsAdmin';

export const dynamic = 'force-dynamic';

export default async function OfferWallsPage() {
  const walls = await prisma.offerWall.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { postbacks: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Offerwalls</h1>
      </div>
      <OfferWallsAdmin initialWalls={walls} />
    </div>
  );
}
