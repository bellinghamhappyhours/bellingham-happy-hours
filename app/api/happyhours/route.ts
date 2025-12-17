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
        const menu_url = (r.menu_url || "").trim();

        if (!venue_name || !menu_url) {
          return null;
        }

        // Normalize cuisines (comma-separated in the sheet)
        const cuisine_tags: string[] = (r.cuisine_tags || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

        // Normalize/validate day_of_week
        const rawDay = (r.day_of_week || "").trim();
        const day = rawDay as DayOfWeek;

        if (!VALID_DAYS.includes(day)) {
          return null;
        }

        // Basic time strings, passed through as-is ("HH:MM") OR "Close"
        const start_time = (r.start_time || "").trim();
        const end_time = (r.end_time || "").trim();

        if (!start_time || !end_time) {
          return null;
        }

        // Optional: only used when end_time === "Close"
        const close_time = (r.close_time || "").trim() || undefined;

        // Build a stable-ish id
        const id =
          (r.id as string) ||
          [
            venue_name,
            day,
            start_time,
            end_time,
            close_time || "",
            (r.deal_label || "").trim(),
          ].join("|");

        const row: HappyHourRow = {
          id,
          venue_name,
          neighborhood: (r.neighborhood || "").trim(),
          cuisine_tags,
          menu_url,
          website_url: (r.website_url || "").trim() || undefined,
          day_of_week: day,
          start_time,
          end_time,
          close_time, // <-- NEW (safe if undefined)
          type: (r.type || "").trim(),
          deal_label: (r.deal_label || "").trim() || undefined,
          notes: (r.notes || "").trim() || undefined,
          last_verified: (r.last_verified || "").trim() || undefined,
        };

        return row;
      })
      .filter((r): r is HappyHourRow => r !== null);

    return NextResponse.json({ rows });
  } catch (err: any) {
    console.error("Error loading sheet:", err);
    return NextResponse.json(
      { error: "Failed to fetch sheet CSV" },
      { status: 500 }
    );
  }
}
