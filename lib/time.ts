// lib/time.ts

import type { HappyHourRow } from "./types";

/**
 * Convert "HH:MM" (24-hour) into minutes after midnight.
 * Example: "15:30" -> 930
 */
export function minutesFromHHMM(hhmm: string): number {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;
  return h * 60 + m;
}

/**
 * Format "HH:MM" (24-hour) into "h:MM AM/PM".
 * Example: "15:30" -> "3:30 PM"
 */
export function format12h(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  let h = Number(hStr) || 0;
  const m = Number(mStr) || 0;

  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;

  const mm = String(m).padStart(2, "0");
  return `${h}:${mm} ${suffix}`;
}

/**
 * Check if a given row is "active" right now, based on its start/end time.
 * We ONLY care about the deal window, not full business hours.
 * Handles windows that cross midnight, like 9:00 PM – 1:30 AM.
 */
export function isOpenNow(row: HappyHourRow, now: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let start = minutesFromHHMM(row.start_time);
  let end = minutesFromHHMM(row.end_time);

  if (Number.isNaN(start) || Number.isNaN(end)) return false;

  // If the end is "earlier" than start, it crosses midnight.
  if (end < start) {
    const nowAdj = nowMinutes < start ? nowMinutes + 24 * 60 : nowMinutes;
    end += 24 * 60;
    return nowAdj >= start && nowAdj <= end;
  }

  return nowMinutes >= start && nowMinutes <= end;
}
