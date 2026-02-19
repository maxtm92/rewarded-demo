import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import PremiumOffersAdmin from '@/components/admin/PremiumOffersAdmin';

export const dynamic = 'force-dynamic';

export default async function PremiumOffersPage() {
  const [offers, angles] = await Promise.all([
    prisma.premiumOffer.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { completions: true } } },
    }),
    prisma.marketingAngle.findMany({ where: { isActive: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Premium Offers</h1>
      <PremiumOffersAdmin initialOffers={offers} angles={angles} />
    </div>
  );
}
