'use client';

// GA4
export function trackGA4(event: string, params?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  const w = window as typeof window & { gtag?: (...args: unknown[]) => void };
  if (w.gtag) {
    w.gtag('event', event, params);
  }
}

// Facebook Pixel
export function trackFBPixel(event: string, params?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  const w = window as typeof window & { fbq?: (...args: unknown[]) => void };
  if (w.fbq) {
    w.fbq('track', event, params);
  }
}
