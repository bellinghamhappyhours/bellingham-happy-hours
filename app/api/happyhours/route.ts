// app/api/happyhours/route.ts

import { NextResponse } from "next/server";
import Papa from "papaparse";
import type { HappyHourRow, DayOfWeek } from "../../../lib/types";

const SHEET_CSV_URL = process.env.SHEET_CSV_URL;

const VALID_DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function normalizeTime(v: string): string {
  const raw = (v || "").trim();
  if (!raw) return "";

  const lower = raw.toLowerCase();
  if (lower === "open") return "Open";
  if (lower === "close") return "Close";

  // Accept HH:MM or H:MM (24h). Normalize to HH:MM.
  const m = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return raw; // leave as-is; UI may treat it as invalid

  const hh = m[1].padStart(2, "0");
  const mm = m[2];
  return `${hh}:${mm}`;
}

function normalizeDay(v: string): DayOfWeek | null {
  const raw = (v || "").trim();
  return (VALID_DAYS as string[]).includes(raw) ? (raw as DayOfWeek) : null;
}

export async function GET() {
  if (!SHEET_CSV_URL) {
    return NextResponse.json(
      { error: "Missing SHEET_CSV_URL env var" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Sheet HTTP error",
          status: res.status,
          statusText: res.statusText,
        },
        { status: 500 }
      );
    }

    const csvText = await res.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const rows: HappyHourRow[] = (parsed.data as any[])
      .map((r, idx) => {
        const venue_name = (r.venue_name || "").trim();
        if (!venue_name) return null;

        const menu_url = (r.menu_url || "").trim();
        const website_url = (r.website_url || "").trim();

        // Require at least one link so the row is actionable
        if (!menu_url && !website_url) return null;

        const cuisine_tags: string[] = (r.cuisine_tags || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

        const day = normalizeDay(r.day_of_week || "");
        if (!day) return null;

        const start_time = normalizeTime(r.start_time || "");
        const end_time = normalizeTime(r.end_time || "");

        // still require start & end to exist
        if (!start_time || !end_time) return null;

        const open_time_raw = normalizeTime(r.open_time || "");
        const close_time_raw = normalizeTime(r.close_time || "");

        const open_time =
          open_time_raw && open_time_raw !== "Open" && open_time_raw !== "Close"
            ? open_time_raw
            : undefined;

        const close_time =
          close_time_raw && close_time_raw !== "Open" && close_time_raw !== "Close"
            ? close_time_raw
            : undefined;

        // If using Open/Close tokens, require the corresponding actual times
        if (start_time === "Open" && !open_time) return null;
        if (end_time === "Close" && !close_time) return null;

        const deal_label = (r.deal_label || "").trim();

        // Ensure IDs are unique even if rows are otherwise identical
        const id =
          (r.id as string) ||
          `${venue_name}|${day}|${start_time}|${end_time}|${deal_label}|${idx}`;

        const row: HappyHourRow = {
          id,
          venue_name,
          neighborhood: (r.neighborhood || "").trim(),
          cuisine_tags,
          menu_url: menu_url || website_url, // fallback so the UI Menu link works
          website_url: website_url || undefined,

          day_of_week: day,
          start_time,
          end_time,
          open_time,
          close_time,

          type: (r.type || "").trim(),
          deal_label: deal_label || undefined,
          notes: (r.notes || "").trim() || undefined,
          last_verified: (r.last_verified || "").trim() || undefined,
        };

        return row;
      })
      .filter((x): x is HappyHourRow => x !== null);

    return NextResponse.json({ rows });
  } catch (err: any) {
    console.error("Error loading sheet:", err);
    return NextResponse.json(
      { error: "Failed to fetch sheet CSV" },
      { status: 500 }
    );
  }
}
