export const STREAK_MULTIPLIERS: Record<number, number> = {
  1: 1.0, 2: 1.1, 3: 1.2, 4: 1.3, 5: 1.35, 6: 1.4, 7: 1.5,
};

export const DAILY_BONUS_CENTS = [1, 2, 2, 3, 3, 4, 5]; // Day 1-7

export function getMultiplier(streak: number): number {
  if (streak <= 0) return 1.0;
  if (streak >= 7) return 1.5;
  return STREAK_MULTIPLIERS[streak] ?? 1.0;
}

export function getDailyBonus(streak: number): number {
  const day = Math.min(Math.max(streak, 1), 7);
  return DAILY_BONUS_CENTS[day - 1] ?? 1;
}

export function isConsecutiveDay(
  lastLoginDate: Date | null,
  now: Date
): 'consecutive' | 'same_day' | 'reset' {
  if (!lastLoginDate) return 'consecutive'; // first login ever
  const lastDate = lastLoginDate.toISOString().slice(0, 10);
  const todayDate = now.toISOString().slice(0, 10);
  if (lastDate === todayDate) return 'same_day';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastDate === yesterday.toISOString().slice(0, 10)) return 'consecutive';
  return 'reset';
}
