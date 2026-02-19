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
        <h1 className="text-2xl font-bold mb-2">Earn Rewards</h1>
        <p className="text-gray-400">Complete offers to earn real cash</p>
      </div>

      {walls.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🔧</span>
          <p className="text-gray-400">Offers are being set up. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {walls.map((wall) => (
            <Link
              key={wall.id}
              href={`/earn/${wall.slug}`}
              className="block p-6 rounded-2xl bg-[#151929] border border-white/5 hover:border-emerald-500/30 transition group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-emerald-500/20 to-emerald-600/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {wall.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{wall.name}</h2>
                  <p className="text-gray-400 text-sm">{wall.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Earn up to {formatCurrency(5000)}/offer</span>
                <span className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm transition">
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
