import { prisma } from '@/lib/prisma';
import AnglesAdmin from '@/components/admin/AnglesAdmin';

export const dynamic = 'force-dynamic';

export default async function AnglesPage() {
  const angles = await prisma.marketingAngle.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marketing Angles</h1>
      <AnglesAdmin initialAngles={angles} />
    </div>
  );
}
