"use client";

import React, { useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters";
import { useFavorites } from "../components/useFavorites";
import type { HappyHourRow, DayOfWeek, HHType } from "../lib/types";
import { format12h, isOpenNow, minutesFromHHMM } from "../lib/time";

type ApiResponse = { rows: HappyHourRow[] };

// For mapping "Today" to a sheet day name
const DAY_NAMES: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as unknown as DayOfWeek[];

function normalizeDayName(v: string | undefined | null): string {
  return (v || "").trim().toLowerCase();
}

export default function Page() {
  const [rows, setRows] = useState<HappyHourRow[]>([]);
  const [loading, setLoading] = useState(true);

  const favorites = useFavorites();

  // ✅ IMPORTANT: use the same types Filters expects
  const [day, setDay] = useState<DayOfWeek | "Today">("Today");
  const [type, setType] = useState<HHType | "any">("any");

  const [cuisine, setCuisine] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [timeMode, setTimeMode] = useState<"now" | "custom">("custom");
  const [timeHHMM, setTimeHHMM] = useState("17:00"); // 5:00 PM
  const [showAllForDay, setShowAllForDay] = useState(true);
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
    rows.forEach((r) => r.cuisine_tags.forEach((t) => t && s.add(t)));
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
    const todayName = DAY_NAMES[now.getDay()] || "Monday";
    const effectiveDay: DayOfWeek = day === "Today" ? todayName : day;

    const normEffective = normalizeDayName(effectiveDay);

    return rows
      // 1) Day match – case-insensitive + trimmed on BOTH sides
      .filter((r) => normalizeDayName(r.day_of_week) === normEffective)

      // 2) Type filter: any | Food | Drink | Food and Drink
      .filter((r) => {
        if (type === "any") return true;

        const rowType = (r.type || "").toLowerCase();

        if (type === "Food") {
          return rowType.includes("food") && !rowType.includes("drink");
        }
        if (type === "Drink") {
          return rowType.includes("drink") && !rowType.includes("food");
        }
        if (type === "Food and Drink") {
          return rowType.includes("food") && rowType.includes("drink");
        }
        return true;
      })

      // 3) Cuisine filter
      .filter((r) => (cuisine ? r.cuisine_tags.includes(cuisine) : true))

      // 4) Neighborhood filter
      .filter((r) =>
        neighborhood ? (r.neighborhood || "").trim() === neighborhood : true
      )

      // 5) Saved only
      .filter((r) => (showSavedOnly ? favorites.has(r.id) : true))

      // 6) Time filtering
      .filter((r) => {
        if (showAllForDay) return true;

        if (timeMode === "now") {
          // "right now" means: deal window covers current time
          return isOpenNow(r, now);
        }

        const targetMin = minutesFromHHMM(timeHHMM);
        const start = minutesFromHHMM(r.start_time);
        let end = minutesFromHHMM(r.end_time);

        if (
          Number.isNaN(start) ||
          Number.isNaN(end) ||
          Number.isNaN(targetMin)
        ) {
          return false;
        }

        const crosses = end < start; // crosses midnight
        if (crosses) end += 24 * 60;

        const tAdj =
          crosses && targetMin < start ? targetMin + 24 * 60 : targetMin;

        return tAdj >= start && tAdj <= end;
      })

      // 7) Sort by start time, then venue name
      .sort((a, b) => {
        const aStart = minutesFromHHMM(a.start_time);
        const bStart = minutesFromHHMM(b.start_time);
        if (aStart !== bStart) return aStart - bStart;
        return a.venue_name.localeCompare(b.venue_name);
      });
  }, [
    rows,
    day,
    type,
    cuisine,
    neighborhood,
    timeMode,
    timeHHMM,
    showAllForDay,
    showSavedOnly,
    favorites,
  ]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>Bellingham Happy Hours</h1>
        <div style={{ color: "#555", fontSize: 14 }}>
          Filter by day, time, and cuisine. Menu links go straight to the source.
        </div>
        <div style={{ color: "#666", fontSize: 13, lineHeight: 1.4, maxWidth: 720 }}>
          I built this tool for myself and figured the community and local businesses
          would benefit from it too.
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
        showAllForDay={showAllForDay}
        setShowAllForDay={setShowAllForDay}
        showSavedOnly={showSavedOnly}
        setShowSavedOnly={setShowSavedOnly}
      />

      <div style={{ height: 14 }} />

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 14, color: "#333" }}>
            {loading
              ? "Loading…"
              : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
          </div>
          <button
            onClick={() => favorites.clear()}
            style={ghostButtonStyle}
            title="Clears saved favorites on this device"
          >
            Clear saved
          </button>
        </div>

        <div style={{ height: 12 }} />

        {loading ? null : filtered.length === 0 ? (
          <div style={{ color: "#666", padding: 10 }}>
            No matches. Try switching day/time or widening filters.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, color: "#666" }}>
                  <th style={thStyle}>Save</th>
                  <th style={thStyle}>Place</th>
                  <th style={thStyle}>When</th>
                  <th style={thStyle}>Deal</th>
                  <th style={thStyle}>Type</th>
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
                      <button
                        onClick={() => favorites.toggle(r.id)}
                        aria-label="Save"
                        style={iconButtonStyle}
                      >
                        {favorites.has(r.id) ? "♥" : "♡"}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{r.venue_name}</div>
                    </td>
                    <td style={tdStyle}>
                      {format12h(r.start_time)}–{format12h(r.end_time)}
                    </td>
                    <td style={tdStyle}>
                      {r.deal_label ? (
                        <span style={dealPillStyle(r.deal_label)}>
                          {r.deal_label}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={tdStyle}>{displayType(r.type)}</td>
                    <td style={tdStyle}>{r.cuisine_tags.join(", ")}</td>
                    <td style={tdStyle}>{r.neighborhood || "—"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <a
                          href={r.menu_url}
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          Menu
                        </a>
                        {r.website_url ? (
                          <a
                            href={r.website_url}
                            target="_blank"
                            rel="noreferrer"
                            style={linkStyle}
                          >
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
      <div style={{ marginBottom: 4 }}>
        Corrections or menu updates?{" "}
        <a
          href="mailto:bellinghamhappyhours@gmail.com"
          style={{ color: "#111", textDecoration: "underline" }}
        >
          bellinghamhappyhours@gmail.com
        </a>
      </div>

      <div style={{ marginBottom: 4 }}>
        Instagram (under development):{" "}
        <a
          href="https://www.instagram.com/BHAMhappyhours/"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#111", textDecoration: "underline" }}
        >
          @BHAMhappyhours
        </a>
      </div>

      <div>
        Beta: Hours & specials can change quickly. Please confirm details with the
        venue.
      </div>
    </footer>

    </div>
  );
}

function displayType(t: string | undefined): string {
  if (!t) return "—";
  const lower = t.toLowerCase().trim();
  if (lower === "food and drink") return "Food & Drink";
  return t;
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

function dealPillStyle(label: string): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block",
  };

  const v = label.toLowerCase();

  if (v.includes("happy hour")) {
    return { ...base, border: "1px solid #d7f0d7", background: "#effaf0", color: "#1d6b2a" };
  }
  if (v.includes("late night")) {
    return { ...base, border: "1px solid #e0d7f0", background: "#f2effa", color: "#4b2ca3" };
  }
  if (v.includes("taco")) {
    return { ...base, border: "1px solid #ffe2bf", background: "#fff4e5", color: "#b15b07" };
  }

  return { ...base, border: "1px solid #e0e0e0", background: "#f5f5f5", color: "#555" };
}
