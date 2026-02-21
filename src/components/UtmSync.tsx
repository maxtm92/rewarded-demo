'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { getStoredUtmParams, clearUtmParams, captureUtmParams } from '@/lib/utm';

export default function UtmSync() {
  const { data: session } = useSession();
  const synced = useRef(false);

  // Capture UTM params on every page load
  useEffect(() => {
    captureUtmParams();
  }, []);

  // Sync to DB once authenticated
  useEffect(() => {
    if (!session?.user?.id || synced.current) return;

    const utm = getStoredUtmParams();
    if (!utm) return;

    synced.current = true;

    fetch('/api/utm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(utm),
    })
      .then(() => clearUtmParams())
      .catch(() => {});
  }, [session?.user?.id]);

  return null;
}
