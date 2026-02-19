'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/utils';

const navItems = [
  { href: '/earn', label: 'Earn', icon: '💰' },
  { href: '/offers', label: 'Offers', icon: '🔥' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/earn" className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span className="font-bold">Rewarded</span>
          </Link>
          {session?.user && (
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 font-semibold text-sm">
                  {formatCurrency(session.user.balanceCents)}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0E1A]/90 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-7xl mx-auto flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition ${
                  isActive ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
