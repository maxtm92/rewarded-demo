export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatCurrency(cents: number): string {
  return `$${centsToDollars(cents)}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
