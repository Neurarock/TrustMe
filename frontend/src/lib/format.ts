import type { Currency } from "@/types";

const CURRENCY_LOCALE: Record<Currency, string> = {
  GBP: "en-GB",
  USD: "en-US",
  EUR: "en-IE",
};

/** Format a money amount, e.g. formatMoney(38.4, "GBP") -> "£38.40". */
export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
  }).format(amount);
}

/** Short, human time like "10:04" used in audit logs. */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Relative time like "2m ago" / "just now" for activity feeds. */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diffSeconds = Math.round((then - now) / 1000);
  const abs = Math.abs(diffSeconds);

  if (abs < 45) return "just now";
  const minutes = Math.round(diffSeconds / 60);
  if (Math.abs(minutes) < 60) return rtf(minutes, "minute");
  const hours = Math.round(diffSeconds / 3600);
  if (Math.abs(hours) < 24) return rtf(hours, "hour");
  const days = Math.round(diffSeconds / 86400);
  return rtf(days, "day");
}

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function rtf(value: number, unit: Intl.RelativeTimeFormatUnit): string {
  return formatter.format(value, unit);
}
