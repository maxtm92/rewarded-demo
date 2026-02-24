'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/offerwalls', label: 'Offerwalls', icon: '🏪' },
  { href: '/admin/everflow', label: 'Everflow', icon: '🔗' },
  { href: '/admin/offers', label: 'Premium Offers', icon: '🔥' },
  { href: '/admin/angles', label: 'Marketing Angles', icon: '🎯' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/transactions', label: 'Transactions', icon: '💳' },
  { href: '/admin/postbacks', label: 'Postbacks', icon: '🔔' },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: '💸' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center gap-2 px-3 py-4 mb-2">
          <span className="text-lg">⚙️</span>
          <span className="font-semibold text-gray-900">Admin</span>
        </div>
        <nav className="flex-1 space-y-0.5">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link
          href="/earn"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition"
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
