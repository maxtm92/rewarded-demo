import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import PageTransition from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';

export const dynamic = 'force-dynamic';

const gradients = [
  'bg-gradient-to-br from-[#01d676]/30 via-[#0a2e1f] to-[#141523]',
  'bg-gradient-to-br from-[#6366f1]/30 via-[#1e1b4b] to-[#141523]',
  'bg-gradient-to-br from-[#f59e0b]/30 via-[#451a03] to-[#141523]',
  'bg-gradient-to-br from-[#ec4899]/30 via-[#500724] to-[#141523]',
  'bg-gradient-to-br from-[#06b6d4]/30 via-[#083344] to-[#141523]',
];

export default async function EarnPage() {
  const walls = await prisma.offerWall.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <PageTransition>
      {/* Header with stats */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Earn Rewards</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[#a9a9ca]">
            {walls.length} offerwall{walls.length !== 1 ? 's' : ''} available
          </span>
          <span className="w-1 h-1 rounded-full bg-[#393e56]" />
          <span className="text-[#01d676] font-medium">Up to $50+ per offer</span>
        </div>
      </div>

      {walls.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[#1d1d2e] border border-[#393e56] card-shadow">
          <span className="text-5xl mb-4 block">🔧</span>
          <p className="text-[#a9a9ca]">Offers are being set up. Check back soon!</p>
        </div>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {walls.map((wall, index) => (
            <StaggerItem key={wall.id}>
              <Link
                href={`/earn/${wall.slug}`}
                className="block rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#01d676]/40 overflow-hidden transition group card-inset hover-lift"
              >
                {/* Banner area */}
                <div className="relative h-40 overflow-hidden">
                  {wall.logoUrl ? (
                    <>
                      <div className={`w-full h-full ${gradients[index % gradients.length]}`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={wall.logoUrl}
                          alt={wall.name}
                          className="w-16 h-16 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </>
                  ) : (
                    <div className={`w-full h-full ${gradients[index % gradients.length]}`} />
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d2e] via-[#1d1d2e]/40 to-transparent" />
                  {/* Icon + name overlay */}
                  <div className="absolute bottom-4 left-5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1d1d2e]/80 backdrop-blur-sm border border-[#393e56] flex items-center justify-center text-2xl icon-bounce">
                      {wall.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white drop-shadow-sm">{wall.name}</h2>
                      {wall.description && (
                        <p className="text-[#a9a9ca] text-sm">{wall.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom section */}
                <div className="p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#01d676]/10 text-[#01d676] text-xs font-semibold">
                      Up to {formatCurrency(5000)}/offer
                    </span>
                    {wall.payoutMultiplier > 1 && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#2f3043] text-[#a9a9ca] text-xs font-medium">
                        {wall.payoutMultiplier}x multiplier
                      </span>
                    )}
                  </div>
                  <div className="w-full py-3.5 rounded-xl bg-[#01d676] text-black font-semibold text-sm text-center transition group-hover:bg-[#01ff97] glow-green-cta btn-hover">
                    Start Earning
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </PageTransition>
  );
}
