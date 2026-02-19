'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/offerwalls', label: 'Offerwalls', icon: '🏪' },
  { href: '/admin/offers', label: 'Premium Offers', icon: '🔥' },
  { href: '/admin/angles', label: 'Marketing Angles', icon: '🎯' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/transactions', label: 'Transactions', icon: '💳' },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: '💸' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1117] border-r border-white/5 p-4 flex flex-col">
        <div className="flex items-center gap-2 px-3 py-4 mb-4">
          <span className="text-xl">⚙️</span>
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-emerald-600/10 text-emerald-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link
          href="/earn"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-white transition"
        >
          <span>←</span>
          <span>Back to App</span>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
