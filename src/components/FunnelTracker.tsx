'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function FunnelTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Fire page_view event on each navigation
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'page_view', metadata: { page: pathname } }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
