import crypto from 'crypto';

export interface PostbackParams {
  userId: string;
  externalId: string;
  payoutCents: number;
  offerId?: string;
  offerName?: string;
}

// Each offerwall uses different parameter names
const PARAM_MAPS: Record<string, { userId: string; externalId: string; payout: string; offerId?: string; offerName?: string }> = {
  freecash: { userId: 'user_id', externalId: 'transaction_id', payout: 'amount', offerId: 'offer_id', offerName: 'offer_name' },
  playful: { userId: 'userId', externalId: 'txId', payout: 'reward', offerId: 'offerId', offerName: 'offerName' },
  tester: { userId: 'sub_id', externalId: 'txn_id', payout: 'payout', offerId: 'offer_id' },
  fluent: { userId: 'subid1', externalId: 'transaction_id', payout: 'amount', offerId: 'offer_id' },
};

export function extractPostbackParams(wallSlug: string, searchParams: URLSearchParams): PostbackParams | null {
  const map = PARAM_MAPS[wallSlug];
  if (!map) return null;

  const userId = searchParams.get(map.userId);
  const externalId = searchParams.get(map.externalId);
  const payoutRaw = searchParams.get(map.payout);

  if (!userId || !externalId || !payoutRaw) return null;

  // Payout comes in dollars (or cents depending on wall) — normalize to cents
  const payoutValue = parseFloat(payoutRaw);
  if (isNaN(payoutValue)) return null;

  // Most walls send in dollars, convert to cents
  const payoutCents = Math.round(payoutValue * 100);

  return {
    userId,
    externalId,
    payoutCents,
    offerId: map.offerId ? (searchParams.get(map.offerId) ?? undefined) : undefined,
    offerName: map.offerName ? (searchParams.get(map.offerName) ?? undefined) : undefined,
  };
}

export function validateSignature(
  wallSlug: string,
  secret: string,
  searchParams: URLSearchParams
): boolean {
  const sig = searchParams.get('sig') || searchParams.get('signature') || searchParams.get('hash');
  if (!sig) return false;

  // Build signature string from sorted params (excluding the sig itself)
  const params = new URLSearchParams(searchParams);
  params.delete('sig');
  params.delete('signature');
  params.delete('hash');

  // Sort params alphabetically
  const sortedEntries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const payload = sortedEntries.map(([k, v]) => `${k}=${v}`).join('&');

  // HMAC-SHA256
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
