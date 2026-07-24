/** Local calendar helpers for <input type="date"> — avoid UTC day-shift from toISOString / Date("YYYY-MM-DD"). */

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Start of local calendar day. */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Add whole local days (handles month/year rollover). */
export function addLocalDays(date: Date, days: number): Date {
  const d = startOfLocalDay(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Format Date → YYYY-MM-DD for controlled date inputs (local). */
export function formatDateInputValue(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Parse YYYY-MM-DD as local midnight; empty/invalid → null. */
export function parseDateInputValue(value: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map((part) => parseInt(part, 10));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}
