import { NextResponse } from "next/server";
import Papa from "papaparse";
import { HappyHourRow, DayOfWeek, HHType } from "../../../lib/types";

type RawRow = {
  venue_name?: string;
  neighborhood?: string;
  cuisine_tags?: string;
  menu_url?: string;
  website_url?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  type?: string;
  notes?: string;
  last_verified?: string;
  deal_label?: string;
};

const DAY_MAP: Record<string, DayOfWeek> = {
  Mon: "Mon",
  Monday: "Mon",
  Tue: "Tue",
  Tuesday: "Tue",
  Wed: "Wed",
  Wednesday: "Wed",
  Thu: "Thu",
  Thursday: "Thu",
  Fri: "Fri",
  Friday: "Fri",
  Sat: "Sat",
  Saturday: "Sat",
  Sun: "Sun",
  Sunday: "Sun",
};

function normalizeDay(raw: string | undefined): DayOfWeek | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  return DAY_MAP[trimmed] ?? null;
}

function normalizeType(raw: string | undefined): HHType | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (v === "food") return "food";
  if (v === "drink") return "drink";
  if (v === "both") return "both";
  return null;
}

function normalizeTime(raw: string | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim().toLowerCase();
  if (t === "close" || t === "closing") return "23:59"; // legacy safety
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  const hh = String(h).padStart(2, "0");
  const mm = String(min).padStart(2, "0");
  return `${hh}:${mm}`;
}

function toHappyHourRows(rawRows: RawRow[]): HappyHourRow[] {
  const rows: HappyHourRow[] = [];

  rawRows.forEach((r, idx) => {
    const venue = (r.venue_name || "").trim();
    if (!venue) return;

    const day = normalizeDay(r.day_of_week);
    const type = normalizeType(r.type);
    const start = normalizeTime(r.start_time);
    const end = normalizeTime(r.end_time);

    if (!day || !type || !start || !end) {
      return;
    }

    const cuisines =
      (r.cuisine_tags || "")
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean) || [];

    rows.push({
      id: `${venue}-${day}-${start}-${idx}`,
      venue_name: venue,
      neighborhood: (r.neighborhood || "").trim(),
      cuisine_tags: cuisines,
      menu_url: r.menu_url || "",
      website_url: r.website_url || "",
      day_of_week: day,
      start_time: start,
      end_time: end,
      type,
      notes: r.notes || "",
      last_verified: r.last_verified || "",
      deal_label: r.deal_label || "",
    });
  });

  return rows;
}

export async function GET() {
  try {
    const url = process.env.SHEET_CSV_URL;

    if (!url) {
      return NextResponse.json(
        { error: "SHEET_CSV_URL is not set in environment variables" },
        { status: 500 }
      );
    }

    const res = await fetch(url);

    if (!res.ok) {
      // Show some detail to help debug (status + first 200 chars of body)
      let bodySnippet = "";
      try {
        const bodyText = await res.text();
        bodySnippet = bodyText.slice(0, 200);
      } catch {
        bodySnippet = "(could not read body text)";
      }

      return NextResponse.json(
        {
          error: "Sheet HTTP error",
          status: res.status,
          statusText: res.statusText,
          snippet: bodySnippet,
        },
        { status: 500 }
      );
    }

    const csvText = await res.text();

    const parsed = Papa.parse<RawRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors && parsed.errors.length > 0) {
      return NextResponse.json(
        {
          error: "CSV parse error",
          firstError: parsed.errors[0].message,
        },
        { status: 500 }
      );
    }

    const rows = toHappyHourRows(parsed.data || []);

    return NextResponse.json({ rows });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Unexpected server error",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
