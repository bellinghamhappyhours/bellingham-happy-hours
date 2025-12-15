"use client";

import { useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters";
import { useFavorites } from "../components/useFavorites";
import { HappyHourRow, DayOfWeek, HHType } from "../lib/types";
import { dayLabelFromDate, format12h, minutesFromHHMM } from "../lib/time";

type ApiResponse = { rows: HappyHourRow[] };

function crossesMidnight(row: HappyHourRow) {
  const start = minutesFromHHMM(row.start_time);
  const end = minutesFromHHMM(row.end_time);
  return end < start;
}

// Checks open/closed for a given time-of-day, ignoring day-of-week.
// (We handle day matching separately in filters.)
function isOpenAtMinutes(row: HappyHourRow, minutesOfDay: number): boolean {
  const start = minutesFromHHMM(row.start_time);
  let end = minutesFromHHMM(row.end_time);

  const cross = end < start;
  if (cross) end += 24 * 60;

  const mAdj = cross && minutesOfDay < start ? minutesOfDay + 24 * 60 : minutesOfDay;
  return mAdj >= start && mAdj <= end;
}

function displayType(t: HHType) {
  if (t === "food") return "Food";
  if (t === "drink") return "Drink";
  return "Food & Drink";
}

function matchesType(rowType: HHType, filter: HHType | "any") {
  if (filter === "any") return true;

  // If a row is "both", it should show up for either Food or Drink filters.
  if (filter === "food") return rowType === "food" || rowType === "both";
  if (filter === "drink") return rowType === "drink" || rowType === "both";

  // filter === "both" means: only show rows explicitly marked as both
  return rowType === "both";
}

function dayIndex(d: DayOfWeek) {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(d);
}

function prevDay(d: DayOfWeek): DayOfWeek {
  const idx = dayIndex(d);
  const arr: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return arr[(idx + 6) % 7];
}

export default function Page() {
  const [rows, setRows] = useState<HappyHourRow[]>([]);
  const [loading, setLoading] = useState(true);

  const favorites = useFavorites();

  const [day, setDay] = useState<DayOfWeek | "Today">("Today");
  const [type, setType] = useState<HHType | "any">("any");
  const [cuisine, setCuisine] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  // Default: At a time, 5:00 PM
  const [timeMode, setTimeMode] = useState<"now" | "custom">("custom");
  const [timeHHMM, setTimeHHMM] = useState("17:00");

  // NEW: show all for selected day (ignore time filter)
  const [showAllDay, setShowAllDay] = useState(false);

  const [sort, setSort] = useState<"open" | "soon" | "az">("open");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/happyhours");
        const data = (await res.json()) as ApiResponse;
        setRows(data.rows || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allCuisines = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => r.cuisine_tags.forEach((t) => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const allNeighborhoods = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => {
      const n = (r.neighborhood || "").trim();
      if (n) s.add(n);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const now = new Date();
    const effectiveDay: DayOfWeek = day === "Today" ? dayLabelFromDate(now) : day;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const targetMin = timeMode === "now" ? nowMin : minutesFromHHMM(timeHHMM);

    // For very late/early selections (00:00–01:30), optionally include “carry-over”
    // windows that started the previous day and cross midnight.
    const includePrevLateCarry = targetMin <= 90; // 01:30
    const prev = prevDay(effectiveDay);

    const base = rows
      .filter((r) => {
        const isSameDay = r.day_of_week === effectiveDay;
        const isPrevCarry = includePrevLateCarry && r.day_of_week === prev && crossesMidnight(r);
        return isSameDay || isPrevCarry;
      })
      .filter((r) => matchesType(r.type, type))
      .filter((r) => (cuisine ? r.cuisine_tags.includes(cuisine) : true))
      .filter((r) => (neighborhood ? (r.neighborhood || "").trim() === neighborhood : true))
      .filter((r) => (showSavedOnly ? favorites.has(r.id) : true));

    const timeFiltered = showAllDay ? base : base.filter((r) => isOpenAtMinutes(r, targetMin));

    // Sorting:
    // - If showAllDay is OFF, sorting is mostly by start time or A–Z (since everything matches the time anyway)
    // - If showAllDay is ON, sorting becomes meaningful: open/upcoming/ended relative to the chosen time
    return timeFiltered.sort((a, b) => {
      if (sort === "az") return a.venue_name.localeCompare(b.venue_name);

      const aStart = minutesFromHHMM(a.start_time);
      const bStart = minutesFromHHMM(b.start_time);

      if (!showAllDay) {
        // simple and predictable when already time-filtered
        if (aStart !== bStart) return aStart - bStart;
        return a.venue_name.localeCompare(b.venue_name);
      }

      const aOpen = isOpenAtMinutes(a, targetMin);
      const bOpen = isOpenAtMinutes(b, targetMin);

      const aUpcoming = !aOpen && aStart >= targetMin;
      const bUpcoming = !bOpen && bStart >= targetMin;

      // Category: open -> upcoming -> ended
      const aCat = aOpen ? 0 : aUpcoming ? 1 : 2;
      const bCat = bOpen ? 0 : bUpcoming ? 1 : 2;

      if (sort === "open") {
        if (aCat !== bCat) return aCat - bCat;
        // within buckets, earlier start first
        if (aStart !== bStart) return aStart - bStart;
        return a.venue_name.localeCompare(b.venue_name);
      }

      // sort === "soon"
      // Open items first, then upcoming by minutes-until-start, then ended last.
      const aSoonKey = aOpen ? 0 : aUpcoming ? (aStart - targetMin) : 100000 + aStart;
      const bSoonKey = bOpen ? 0 : bUpcoming ? (bStart - targetMin) : 100000 + bStart;

      if (aSoonKey !== bSoonKey) return aSoonKey - bSoonKey;

      if (aStart !== bStart) return aStart - bStart;
      return a.venue_name.localeCompare(b.venue_name);
    });
  }, [rows, day, type, cuisine, neighborhood, timeMode, timeHHMM, showAllDay, sort, showSavedOnly, favorites]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Bellingham Happy Hours</h1>
        <div style={{ color: "#555", fontSize: 14 }}>
          Filter by day, time, and cuisine. Menu links go straight to the source.
        </div>
      </header>

      <Filters
        allCuisines={allCuisines}
        allNeighborhoods={allNeighborhoods}
        day={day}
        setDay={setDay}
        type={type}
        setType={setType}
        cuisine={cuisine}
        setCuisine={setCuisine}
        neighborhood={neighborhood}
        setNeighborhood={setNeighborhood}
        timeMode={timeMode}
        setTimeMode={setTimeMode}
        timeHHMM={timeHHMM}
        setTimeHHMM={setTimeHHMM}
        showAllDay={showAllDay}
        setShowAllDay={setShowAllDay}
        sort={sort}
        setSort={setSort}
        showSavedOnly={showSavedOnly}
        setShowSavedOnly={setShowSavedOnly}
      />

      <div style={{ height: 14 }} />

      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 14, color: "#333" }}>
            {loading ? "Loading…" : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
          </div>
          <button onClick={() => favorites.clear()} style={ghostButtonStyle} title="Clears saved favorites on this device">
            Clear saved
          </button>
        </div>

        <div style={{ height: 12 }} />

        {loading ? null : filtered.length === 0 ? (
          <div style={{ color: "#666", padding: 10 }}>
            No matches. Try switching day/time or turning on “Show all for day”.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, color: "#666" }}>
                  <th style={thStyle}>Save</th>
                  <th style={thStyle}>Place</th>
                  <th style={thStyle}>Deal</th>
                  <th style={thStyle}>When</th>
                  <th style={thStyle}>Food/Drink</th>
                  <th style={thStyle}>Cuisine</th>
                  <th style={thStyle}>Neighborhood</th>
                  <th style={thStyle}>Links</th>
                  <th style={thStyle}>Verified</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={tdStyle}>
                      <button onClick={() => favorites.toggle(r.id)} aria-label="Save" style={iconButtonStyle}>
                        {favorites.has(r.id) ? "♥" : "♡"}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ fontWeight: 600 }}>{r.venue_name}</div>
                        {r.notes ? <div style={{ fontSize: 12, color: "#666" }}>{r.notes}</div> : null}
                      </div>
                    </td>
                    <td style={tdStyle}>{r.deal_label ? <span style={pillStyle}>{r.deal_label}</span> : "—"}</td>
                    <td style={tdStyle}>
                      {format12h(r.start_time)}–{format12h(r.end_time)}
                    </td>
                    <td style={tdStyle}>{displayType(r.type)}</td>
                    <td style={tdStyle}>{r.cuisine_tags.join(", ")}</td>
                    <td style={tdStyle}>{r.neighborhood || "—"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <a href={r.menu_url} target="_blank" rel="noreferrer" style={linkStyle}>
                          Menu
                        </a>
                        {r.website_url ? (
                          <a href={r.website_url} target="_blank" rel="noreferrer" style={linkStyle}>
                            Website
                          </a>
                        ) : null}
                      </div>
                    </td>
                    <td style={tdStyle}>{r.last_verified || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer style={{ padding: "18px 2px", color: "#777", fontSize: 12 }}>
  <div>
    Corrections or menu updates?{" "}
    <a href="mailto:bellinghamhappyhours@gmail.com" style={{ color: "#111", textDecoration: "underline" }}>
      bellinghamhappyhours@gmail.com
    </a>
  </div>
</footer>

    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e6e6e6",
  borderRadius: 12,
  padding: 16,
};

const thStyle: React.CSSProperties = {
  padding: "10px 8px",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 8px",
  verticalAlign: "top",
  fontSize: 14,
};

const linkStyle: React.CSSProperties = {
  textDecoration: "underline",
  color: "#111",
  fontSize: 14,
};

const iconButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontSize: 16,
};

const ghostButtonStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontSize: 13,
  color: "#333",
};

const pillStyle: React.CSSProperties = {
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid #d7f0d7",
  background: "#effaf0",
  fontSize: 12,
  color: "#1d6b2a",
  fontWeight: 600,
};
