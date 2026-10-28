const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD (not UTC, unlike toISOString). */
export function toLocalISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(now = new Date()): string {
  return toLocalISODate(now);
}

export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toLocalISODate(parseISODate(value)) === value;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
}

/** Adds months, clamping the day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(iso: string, months: number): string {
  const date = parseISODate(iso);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toLocalISODate(date);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function diffDays(from: string, to: string): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function minDate(a: string, b: string): string {
  return a <= b ? a : b;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

export function formatDate(iso: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  const key = locale + JSON.stringify(options);
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, formatter);
  }
  return formatter.format(parseISODate(iso));
}

/** "3 listopada 2026" */
export function formatLongDate(iso: string, locale: string): string {
  return formatDate(iso, locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "wt., 3 listopada" */
export function formatShortDate(iso: string, locale: string): string {
  return formatDate(iso, locale, { weekday: 'short', day: 'numeric', month: 'long' });
}

export function formatDateTime(isoTimestamp: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoTimestamp));
}
