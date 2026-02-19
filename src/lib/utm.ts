'use client';

const UTM_STORAGE_KEY = 'rewarded_utm';

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_url?: string;
  referrer?: string;
}

export function captureUtmParams(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
    landing_url: window.location.href,
    referrer: document.referrer || undefined,
  };

  // Only store if we have at least one UTM param
  if (utm.utm_source || utm.utm_medium || utm.utm_campaign) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  }
}

export function getStoredUtmParams(): UtmParams | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(UTM_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearUtmParams(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(UTM_STORAGE_KEY);
}
