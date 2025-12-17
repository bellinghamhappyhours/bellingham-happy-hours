// lib/time.ts

import type { HappyHourRow } from "./types";

/**
 * Convert "HH:MM" (24-hour) into minutes after midnight.
 * Example: "15:30" -> 930
 */
export function minutesFromHHMM(hhmm: string): number {
  const v = (hhmm || "").trim();
  if (!v) return Number.NaN;

  const [hStr, mStr] = v.split(":");
  const h = Number(hStr);
  const m = Number(mStr);

  if (!Number.isFinite(h) || !Number.isFinite(m)) return Number.NaN;
  return h * 60 + m;
}

/**
 * Format "HH:MM" (24-hour) into "h:MM AM/PM".
 * If hhmm is "Close", it returns "Close".
 */
export function format12h(hhmm: string): string {
  const v = (hhmm || "").trim();
  if (!v) return "—";
  if (v.toLowerCase() === "close") return "Close";

  const [hStr, mStr] = v.split(":");
  let h = Number(hStr);
  const m = Number(mStr);

  if (!Number.isFinite(h) || !Number.isFinite(m)) return "—";

  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;

  const mm = String(m).padStart(2, "0");
  return `${h}:${mm} ${suffix}`;
}

/**
 * Resolve the "end time" minutes for a row.
 * - If end_time is a normal "HH:MM", use it.
 * - If end_time is "Close", use close_time.
 * - If end_time is "Close" but close_time is missing/invalid, return NaN.
 *
 * This ensures close_time only matters for the few "Close" rows.
 */
export function endMinutesForRow(row: Pick<HappyHourRow, "end_time" | "close_time">): number {
  const endRaw = (row.end_time || "").trim();
  if (!endRaw) return Number.NaN;

  if (endRaw.toLowerCase() === "close") {
    const ct = (row.close_time || "").trim();
    return minutesFromHHMM(ct);
  }

  return minutesFromHHMM(endRaw);
}

/**
 * Check if a given row is "active" right now, based on its start/end time.
 * We ONLY care about the deal window, not full business hours.
 * Handles windows that cross midnight, like 9:00 PM – 1:30 AM.
 *
 * IMPORTANT:
 * - If end_time is "Close" and close_time is blank, this returns false.
 */
export function isOpenNow(row: HappyHourRow, now: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const start = minutesFromHHMM(row.start_time);
  let end = endMinutesForRow(row);

  if (Number.isNaN(start) || Number.isNaN(end)) return false;

  // If the end is "earlier" than start, it crosses midnight.
  if (end < start) {
    const nowAdj = nowMinutes < start ? nowMinutes + 24 * 60 : nowMinutes;
    end += 24 * 60;
    return nowAdj >= start && nowAdj <= end;
  }

  return nowMinutes >= start && nowMinutes <= end;
}
