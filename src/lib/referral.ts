import { createHash } from 'crypto';

export const REFERRAL_COMMISSION_RATE = 0.10; // 10%

export function generateReferralCode(userId: string): string {
  const hash = createHash('sha256').update(userId + 'etc-referral').digest('hex');
  return hash.slice(0, 8).toUpperCase();
}
