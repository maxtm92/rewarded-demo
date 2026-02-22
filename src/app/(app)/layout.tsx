'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AnimatedBalance from '@/components/animations/AnimatedBalance';
import StreakBanner from '@/components/earn/StreakBanner';

/* ── Inline SVG Icons ──────────────────────────── */

function EarnIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M14.5 9a3.5 3.5 0 0 0-5 0M9.5 15a3.5 3.5 0 0 0 5 0" />
      <path d="M12 6v2m0 8v2" />
    </svg>
  );
}

function OffersIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

function DashboardIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function CashOutIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M12 10v4m0 0l-2-2m2 2l2-2" />
    </svg>
  );
}

function ProfileIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
    </svg>
  );
}

/* ── Nav Items ─────────────────────────────────── */

const navItems = [
  { href: '/earn', label: 'Earn', icon: EarnIcon },
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/withdraw', label: 'Cash Out', icon: CashOutIcon },
  { href: '/profile', label: 'Profile', icon: ProfileIcon },
];

/* ── Layout ────────────────────────────────────── */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#1d1e30]/95 backdrop-blur-xl border-b border-[#393e56]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/earn" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="px-2 h-8 bg-[#01d676] rounded-lg flex items-center justify-center text-black font-bold text-xs">ETC</span>
            <span className="font-bold text-white text-lg hidden sm:inline">Easy Task Cash</span>
          </Link>

          {/* Desktop Nav + Engagement */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                    active
                      ? 'bg-[#01d676]/10 text-[#01d676]'
                      : 'text-[#a9a9ca] hover:text-white hover:bg-[#2f3043]'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {/* Divider */}
            <div className="w-px h-5 bg-[#393e56] mx-2" />
            {/* Streak */}
            <StreakBanner variant="header" />
            {/* Invite */}
            <Link
              href="/referral"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-[#01d676] hover:bg-[#01d676]/10 transition"
            >
              <span>🤝</span> Invite
            </Link>
          </nav>

          {/* Right: Balance + Avatar (+ mobile streak/invite) */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {session?.user ? (
              <>
                {/* Mobile-only streak + invite */}
                <div className="flex md:hidden items-center gap-2">
                  <StreakBanner variant="header" />
                  <Link
                    href="/referral"
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#01d676]/10 text-sm hover:bg-[#01d676]/20 transition"
                  >
                    🤝
                  </Link>
                </div>
                {/* Balance */}
                <div className="balance-badge rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <span className="text-[#01d676] font-semibold text-sm">$</span>
                  <span className="text-white font-semibold text-sm">
                    <AnimatedBalance value={session.user.balanceCents} />
                  </span>
                </div>
                {/* Avatar */}
                <Link
                  href="/profile"
                  className="w-9 h-9 rounded-full bg-[#2f3043] border border-[#393e56] flex items-center justify-center text-sm font-medium text-white hover:border-[#01d676]/50 transition"
                >
                  {(session.user.name || session.user.email || '?')[0].toUpperCase()}
                </Link>
              </>
            ) : (
              <>
                {/* Placeholder to prevent layout shift */}
                <div className="balance-badge rounded-full px-3 py-1.5 flex items-center gap-1.5 opacity-0">
                  <span className="text-sm">$</span>
                  <span className="text-sm">0.00</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#2f3043]" />
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* ── Bottom Nav (mobile only) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#1d1e30]/95 backdrop-blur-xl border-t border-[#393e56]">
        <div className="max-w-7xl mx-auto flex">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 mx-1 rounded-xl text-xs transition ${
                  active ? 'text-[#01d676] bg-[#01d676]/10' : 'text-[#787ead] hover:text-[#a9a9ca]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
