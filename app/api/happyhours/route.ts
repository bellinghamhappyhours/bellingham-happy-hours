import { NextResponse } from "next/server";
import Papa from "papaparse";
import type { HappyHourRow } from "../../../lib/types";

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
  deal_label?: string;
  notes?: string;
  last_verified?: string;
};

export async function GET() {
  const url = process.env.SHEET_CSV_URL;

  if (!url) {
    return NextResponse.json(
      { rows: [], error: "Missing SHEET_CSV_URL" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        {
          rows: [],
          error: "Sheet HTTP error",
          status: res.status,
          statusText: res.statusText,
        },
        { status: 500 }
      );
    }

    const csv = await res.text();

    const parsed = Papa.parse<RawRow>(csv, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors && parsed.errors.length > 0) {
      // If parsing fails badly, surface the first error so we know.
      return NextResponse.json(
        {
          rows: [],
          error: "CSV parse error",
          firstError: parsed.errors[0],
        },
        { status: 500 }
      );
    }

    const rows: HappyHourRow[] = (parsed.data || [])
      .map((r, idx) => {
        const venue_name = (r.venue_name || "").trim();
        const day_of_week = (r.day_of_week || "").trim();
        const start_time = (r.start_time || "").trim();
        const end_time = (r.end_time || "").trim();
        const menu_url = (r.menu_url || "").trim();

        // Basic required fields. If they’re missing, skip the row.
        if (!venue_name || !day_of_week || !start_time || !end_time || !menu_url) {
          return null;
        }

        const cuisine_tags =
          (r.cuisine_tags || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean) || [];

        const id = `${venue_name}-${day_of_week}-${start_time}-${end_time}-${idx}`;

        const row: HappyHourRow = {
          id,
          venue_name,
          neighborhood: (r.neighborhood || "").trim(),
          cuisine_tags,
          menu_url,
          website_url: (r.website_url || "").trim() || undefined,
          day_of_week,
          start_time,
          end_time,
          type: (r.type || "").trim(),
          deal_label: (r.deal_label || "").trim() || undefined,
          notes: (r.notes || "").trim() || undefined,
          last_verified: (r.last_verified || "").trim() || undefined,
        };

        return row;
      })
      .filter((r): r is HappyHourRow => r !== null);

    return NextResponse.json({ rows });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        rows: [],
        error: "Unhandled error in /api/happyhours",
        message: String(err),
      },
      { status: 500 }
    );
  }
}
