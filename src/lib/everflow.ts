const EVERFLOW_API_BASE = 'https://api.eflow.team/v1';

function getApiKey(): string {
  const key = process.env.EVERFLOW_API_KEY;
  if (!key) throw new Error('EVERFLOW_API_KEY is not configured');
  return key;
}

async function eflowFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${EVERFLOW_API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Eflow-API-Key': getApiKey(),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Everflow API ${res.status}: ${text}`);
  }
  return res.json();
}

/* ── Types ─────────────────────────────────────────── */

export interface EverflowOffer {
  network_offer_id: number;
  network_id: number;
  network_advertiser_id: number;
  name: string;
  offer_status: 'active' | 'paused' | 'deleted' | 'archived';
  destination_url: string;
  payout_type: string;
  payout_percentage: number;
  revenue_type: string;
  revenue_percentage: number;
  payout: string;
  revenue: string;
  category: string;
  channels: string[];
  currency_id: string;
  daily_conversion_cap: number;
  weekly_conversion_cap: number;
  monthly_conversion_cap: number;
  global_conversion_cap: number;
  today_revenue: string;
  today_clicks: number;
  time_created: number;
  time_saved: number;
}

export interface EverflowAffiliate {
  network_affiliate_id: number;
  network_id: number;
  name: string;
  account_status: 'active' | 'inactive';
  account_manager_id: number;
  account_manager_name: string;
  today_revenue: string;
  network_country_code: string;
  is_payable: boolean;
  payment_type: string;
  time_created: number;
  time_saved: number;
}

export interface EverflowPixel {
  network_pixel_id: number;
  network_id: number;
  delivery_method: 'postback' | 'tiktok' | 'web' | 'pixel';
  pixel_level: 'global' | 'specific';
  pixel_status: 'active' | 'inactive';
  pixel_type: 'conversion' | 'post_conversion';
  postback_url: string;
  html_code: string;
  network_affiliate_id: number;
  network_affiliate_name: string;
  network_offer_id: number;
  network_offer_name: string;
  description: string;
  delay_ms: number;
  time_created: number;
  time_saved: number;
}

export interface EverflowConversion {
  conversion_id: string;
  transaction_id: string;
  sub1: string;
  sub2: string;
  sub3: string;
  offer_id: number;
  affiliate_id: number;
  status: string;
  payout: number;
  revenue: number;
  country: string;
  region: string;
  city: string;
  device_type: string;
  platform: string;
  browser: string;
  conversion_unix_timestamp: number;
}

interface TableResponse<T> {
  paging: { total_count: number; page: number; page_size: number };
  [key: string]: T[] | unknown;
}

/* ── Offers ────────────────────────────────────────── */

export async function listOffers(status?: string): Promise<EverflowOffer[]> {
  const searchTerms = status
    ? [{ search_type: 'offer_status', value: status }]
    : [];

  const allOffers: EverflowOffer[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const res = await eflowFetch<TableResponse<EverflowOffer>>(
      '/networks/offerstable',
      {
        method: 'POST',
        body: {
          search_terms: searchTerms,
          paging: { page, page_size: pageSize },
          sort: {},
        },
      },
    );

    const offers = (res as Record<string, unknown>).offers as EverflowOffer[] | undefined;
    if (!offers || offers.length === 0) break;

    allOffers.push(...offers);
    if (offers.length < pageSize) break;
    page++;
  }

  return allOffers;
}

export async function getOffer(offerId: number): Promise<EverflowOffer> {
  return eflowFetch<EverflowOffer>(`/networks/offers/${offerId}`);
}

/* ── Tracking Links ────────────────────────────────── */

export async function generateTrackingLink(params: {
  offerId: number;
  affiliateId: number;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
}): Promise<{ url: string }> {
  return eflowFetch<{ url: string }>('/networks/tracking/offers/clicks', {
    method: 'POST',
    body: {
      network_offer_id: params.offerId,
      network_affiliate_id: params.affiliateId,
      ...(params.sub1 && { sub1: params.sub1 }),
      ...(params.sub2 && { sub2: params.sub2 }),
      ...(params.sub3 && { sub3: params.sub3 }),
      ...(params.sub4 && { sub4: params.sub4 }),
      ...(params.sub5 && { sub5: params.sub5 }),
    },
  });
}

// In-memory cache for tracking links (5-minute TTL)
const trackingLinkCache = new Map<string, { url: string; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getCachedTrackingLink(params: {
  offerId: number;
  affiliateId: number;
  sub1: string;
}): Promise<string> {
  const key = `${params.offerId}:${params.affiliateId}:${params.sub1}`;
  const cached = trackingLinkCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.url;

  const result = await generateTrackingLink(params);
  trackingLinkCache.set(key, { url: result.url, expires: Date.now() + CACHE_TTL_MS });
  return result.url;
}

/* ── Affiliates ────────────────────────────────────── */

export async function listAffiliates(): Promise<EverflowAffiliate[]> {
  const allAffiliates: EverflowAffiliate[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const res = await eflowFetch<TableResponse<EverflowAffiliate>>(
      '/networks/affiliatestable',
      {
        method: 'POST',
        body: {
          search_terms: [],
          paging: { page, page_size: pageSize },
          sort: {},
        },
      },
    );

    const affiliates = (res as Record<string, unknown>).affiliates as EverflowAffiliate[] | undefined;
    if (!affiliates || affiliates.length === 0) break;

    allAffiliates.push(...affiliates);
    if (affiliates.length < pageSize) break;
    page++;
  }

  return allAffiliates;
}

/* ── Postback Pixels ───────────────────────────────── */

export async function listPixels(): Promise<EverflowPixel[]> {
  const allPixels: EverflowPixel[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const res = await eflowFetch<TableResponse<EverflowPixel>>(
      '/networks/pixelstable',
      {
        method: 'POST',
        body: {
          search_terms: [],
          paging: { page, page_size: pageSize },
          sort: {},
        },
      },
    );

    const pixels = (res as Record<string, unknown>).pixels as EverflowPixel[] | undefined;
    if (!pixels || pixels.length === 0) break;

    allPixels.push(...pixels);
    if (pixels.length < pageSize) break;
    page++;
  }

  return allPixels;
}

export async function createPixel(config: {
  postbackUrl: string;
  description?: string;
  affiliateId?: number;
  offerId?: number;
}): Promise<EverflowPixel> {
  return eflowFetch<EverflowPixel>('/networks/pixels', {
    method: 'POST',
    body: {
      delivery_method: 'postback',
      pixel_level: config.offerId ? 'specific' : 'global',
      pixel_status: 'active',
      pixel_type: 'conversion',
      postback_url: config.postbackUrl,
      description: config.description || 'Auto-configured by EasyTaskCash',
      network_affiliate_id: config.affiliateId || 0,
      network_offer_id: config.offerId || 0,
      delay_ms: 0,
    },
  });
}

/* ── Conversions Reporting ─────────────────────────── */

export async function getConversions(
  from: string,
  to: string,
  timezone_id?: number,
): Promise<EverflowConversion[]> {
  const res = await eflowFetch<{ conversions: EverflowConversion[] }>(
    '/networks/reporting/conversions',
    {
      method: 'POST',
      body: {
        from,
        to,
        timezone_id: timezone_id ?? 67, // US/Eastern
      },
    },
  );
  return res.conversions || [];
}
