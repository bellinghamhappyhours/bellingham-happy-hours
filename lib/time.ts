// lib/time.ts
import type { HappyHourRow } from "./types";

/**
 * Strict parse "HH:MM" into minutes after midnight.
 * Returns NaN if the string isn't a real HH:MM.
 */
export function minutesFromHHMM(hhmm: string): number {
  const v = (hhmm || "").trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(v);
  if (!m) return Number.NaN;

  const h = Number(m[1]);
  const mins = Number(m[2]);
  if (
    Number.isNaN(h) ||
    Number.isNaN(mins) ||
    h < 0 ||
    h > 23 ||
    mins < 0 ||
    mins > 59
  ) {
    return Number.NaN;
  }

  return h * 60 + mins;
}

export function format12h(hhmm: string): string {
  const total = minutesFromHHMM(hhmm);
  if (Number.isNaN(total)) return "—";

  let h = Math.floor(total / 60);
  const m = total % 60;

  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;

  const mm = String(m).padStart(2, "0");
  return `${h}:${mm}${suffix}`;
}

function resolvedStartHHMM(row: HappyHourRow): string {
  const s = (row.start_time || "").trim();
  if (s.toLowerCase() === "open") return (row.open_time || "").trim();
  return s;
}

function resolvedEndHHMM(row: HappyHourRow): string {
  const e = (row.end_time || "").trim();
  if (e.toLowerCase() === "close") return (row.close_time || "").trim();
  return e;
}

/**
 * Deal window active right now (not business open hours).
 * Supports "Open" + open_time and "Close" + close_time.
 * Supports crossing midnight.
 */
export function isOpenNow(row: HappyHourRow, now: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const startStr = resolvedStartHHMM(row);
  const endStr = resolvedEndHHMM(row);

  let start = minutesFromHHMM(startStr);
  let end = minutesFromHHMM(endStr);

  if (Number.isNaN(start) || Number.isNaN(end)) return false;

  if (end < start) {
    const nowAdj = nowMinutes < start ? nowMinutes + 24 * 60 : nowMinutes;
    end += 24 * 60;
    return nowAdj >= start && nowAdj <= end;
  }

  return nowMinutes >= start && nowMinutes <= end;
}
