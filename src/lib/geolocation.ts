export interface GeoLocation {
  country: string | null;
  region: string | null;
  city: string | null;
  zipcode: string | null;
}

export async function getLocationFromIP(ip: string): Promise<GeoLocation> {
  try {
    // ip-api.com free tier (no key needed, 45 req/min)
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=country,regionName,city,zip`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return { country: null, region: null, city: null, zipcode: null };
    const data = await res.json();
    return {
      country: data.country || null,
      region: data.regionName || null,
      city: data.city || null,
      zipcode: data.zip || null,
    };
  } catch {
    return { country: null, region: null, city: null, zipcode: null };
  }
}

export function parseUserAgent(ua: string | null): {
  deviceType: string | null;
  browser: string | null;
  os: string | null;
} {
  if (!ua) return { deviceType: null, browser: null, os: null };

  // Device type
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  // Browser
  let browser = 'Unknown';
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = 'Chrome';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Edg\//.test(ua)) browser = 'Edge';

  // OS
  let os = 'Unknown';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Linux/.test(ua)) os = 'Linux';

  return { deviceType, browser, os };
}
