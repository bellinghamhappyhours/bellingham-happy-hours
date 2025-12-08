import Papa from "papaparse";
import { NextResponse } from "next/server";
import { HappyHourRow, DayOfWeek, HHType } from "../../../lib/types";

type RawRow = Record<string, string | undefined>;

function normalizeDayToken(token: string): DayOfWeek | null {
  const s = (token || "").trim().toLowerCase();
  if (!s) return null;

  const map: Record<string, DayOfWeek> = {
    mon: "Mon",
    monday: "Mon",
    tue: "Tue",
    tues: "Tue",
    tuesday: "Tue",
    wed: "Wed",
    weds: "Wed",
    wednesday: "Wed",
    thu: "Thu",
    thur: "Thu",
    thurs: "Thu",
    thursday: "Thu",
    fri: "Fri",
    friday: "Fri",
    sat: "Sat",
    saturday: "Sat",
    sun: "Sun",
    sunday: "Sun",
  };

  const cleaned = s.replace(/[^a-z]/g, "");
  return map[cleaned] ?? null;
}

function parseDays(v: string): DayOfWeek[] {
  const raw = (v || "").trim();
  if (!raw) return [];

  const tokens = raw.split(/[,\|\/]+/g).map((t) => t.trim()).filter(Boolean);
  const tokens2 = tokens.length === 1 ? raw.split(/\s+/).map((t) => t.trim()).filter(Boolean) : tokens;

  const days: DayOfWeek[] = [];
  for (const tok of tokens2) {
    const d = normalizeDayToken(tok);
    if (d && !days.includes(d)) days.push(d);
  }
  return days;
}

function normalizeType(v: string): HHType {
  const s = (v || "").trim().toLowerCase();

  // Accept sheet values: Food / Drink / Both
  if (s === "food") return "food";
  if (s === "drink") return "drink";
  if (s === "both") return "both";

  // Accept a couple friendly variants
  if (s === "food & drink" || s === "food and drink") return "both";

  // Default
  return "both";
}

function splitTags(v: string): string[] {
  return (v || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function normalizeTime(v: string): string | null {
  const s = (v || "").trim();
  if (!s) return null;

  if (/^close$/i.test(s)) return "23:59";

  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [hStr, mStr] = s.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isFinite(h) && Number.isFinite(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${mStr}`;
    }
  }

  return null;
}

function normalizeDealLabel(rawDeal: string, rawNotes: string): string {
  const deal = (rawDeal || "").trim();
  if (deal) return deal;

  // Back-compat: if you haven’t added deal_label yet, allow notes like "Late Night" to show up as label
  const notes = (rawNotes || "").trim();
  const lower = notes.toLowerCase();
  const known = ["happy hour", "late night", "all day", "special", "taco tuesday", "pizza night"];
  if (known.some((k) => lower === k)) return notes;

  return "";
}

export async function GET() {
  const url = process.env.SHEET_CSV_URL;
  if (!url) return NextResponse.json({ error: "Missing SHEET_CSV_URL" }, { status: 500 });

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch sheet CSV" }, { status: 502 });

  const csv = await res.text();

  const parsed = Papa.parse<RawRow>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const rows: HappyHourRow[] = [];

  for (const r of parsed.data) {
    const venue = (r.venue_name || "").trim();
    const menu = (r.menu_url || "").trim();
    const website = (r.website_url || "").trim();

    const start = normalizeTime(r.start_time || "");
    const end = normalizeTime(r.end_time || "");
    const days = parseDays(r.day_of_week || "");

    if (!venue || !menu || !start || !end || days.length === 0) continue;

    const neighborhood = (r.neighborhood || "").trim();
    const type = normalizeType(r.type || "");
    const notes = (r.notes || "").trim();
    const last_verified = (r.last_verified || "").trim();
    const deal_label = normalizeDealLabel(r.deal_label || "", notes);

    for (const day of days) {
      rows.push({
        id: `${venue}-${day}-${start}-${end}`.replace(/\s+/g, "-").toLowerCase(),
        venue_name: venue,
        neighborhood,
        cuisine_tags: splitTags(r.cuisine_tags || ""),
        menu_url: menu,
        website_url: website,
        day_of_week: day,
        start_time: start,
        end_time: end,
        type,
        deal_label: deal_label || undefined,
        notes: notes || undefined,
        last_verified: last_verified || undefined,
      });
    }
  }

  return NextResponse.json({ rows });
}
