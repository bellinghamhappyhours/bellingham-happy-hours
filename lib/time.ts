import { DayOfWeek, HappyHourRow } from "./types";

export const DAYS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function dayLabelFromDate(d: Date): DayOfWeek {
  const map: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return map[d.getDay()];
}

export function minutesFromHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function format12h(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  const mm = m.toString().padStart(2, "0");
  return `${h12}:${mm} ${ampm}`;
}

export function isOpenNow(row: HappyHourRow, now: Date): boolean {
  const today = dayLabelFromDate(now);
  if (row.day_of_week !== today) return false;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const start = minutesFromHHMM(row.start_time);
  let end = minutesFromHHMM(row.end_time);

  const crossesMidnight = end < start;
  if (crossesMidnight) end += 24 * 60;

  const nowAdjusted = crossesMidnight && nowMin < start ? nowMin + 24 * 60 : nowMin;
  return nowAdjusted >= start && nowAdjusted <= end;
}

export function minutesUntilStart(row: HappyHourRow, now: Date): number | null {
  const today = dayLabelFromDate(now);
  if (row.day_of_week !== today) return null;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const start = minutesFromHHMM(row.start_time);
  const delta = start - nowMin;
  return delta >= 0 ? delta : null;
}
