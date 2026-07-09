const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const BALANCE_MASK = '••••••';

export function formatMoney(value: number): string {
  return usd.format(value);
}

export function formatSignedMoney(value: number): string {
  const sign = value < 0 ? '−' : '+';
  return `${sign}${usd.format(Math.abs(value))}`;
}

/** `value` is a fraction, e.g. 0.061 -> "6.1%" (or "+6.1%" when signed). */
export function formatPercent(
  value: number,
  { signed = false }: { signed?: boolean } = {},
): string {
  const pct = Math.abs(value * 100).toFixed(1);
  if (!signed) return `${pct}%`;
  return `${value < 0 ? '−' : '+'}${pct}%`;
}

export function formatShares(shares: number): string {
  return Number.isInteger(shares) ? String(shares) : shares.toFixed(2);
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
