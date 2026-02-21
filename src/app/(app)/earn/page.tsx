import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EarnPage() {
  const walls = await prisma.offerWall.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Earn Rewards</h1>
        <p className="text-[#a9a9ca]">Complete offers to earn real cash</p>
      </div>

      {walls.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🔧</span>
          <p className="text-[#a9a9ca]">Offers are being set up. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {walls.map((wall) => (
            <Link
              key={wall.id}
              href={`/earn/${wall.slug}`}
              className="block p-6 rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#01d676]/50 transition group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#01d676]/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {wall.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white">{wall.name}</h2>
                  <p className="text-[#a9a9ca] text-sm">{wall.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#787ead]">Earn up to {formatCurrency(5000)}/offer</span>
                <span className="px-4 py-2 rounded-lg bg-[#01d676] hover:bg-[#01ff97] text-black font-semibold text-sm transition">
                  Start Earning →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
