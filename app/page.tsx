"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import Filters from "../components/Filters";
import { useFavorites } from "../components/useFavorites";
import { HappyHourRow, DayOfWeek, HHType } from "../lib/types";
import {
  dayLabelFromDate,
  format12h,
  isOpenNow,
  minutesUntilStart,
  minutesFromHHMM,
} from "../lib/time";

type ApiResponse = { rows: HappyHourRow[] };

export default function Page() {
  const [rows, setRows] = useState<HappyHourRow[]>([]);
  const [loading, setLoading] = useState(true);

  const favorites = useFavorites();

  const [day, setDay] = useState<DayOfWeek | "Today">("Today");
  const [type, setType] = useState<HHType | "any">("any");
  const [cuisine, setCuisine] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [timeMode, setTimeMode] = useState<"now" | "custom">("custom");
  const [timeHHMM, setTimeHHMM] = useState("17:00");
  const [showAllForDay, setShowAllForDay] = useState(false);
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
    const effectiveDay: DayOfWeek =
      day === "Today" ? dayLabelFromDate(now) : day;

    return rows
      .filter((r) => r.day_of_week === effectiveDay)
      .filter((r) =>
        type === "any"
          ? true
          : r.type === type || r.type === "both" || type === "both"
      )
      .filter((r) => (cuisine ? r.cuisine_tags.includes(cuisine) : true))
      .filter((r) =>
        neighborhood ? (r.neighborhood || "").trim() === neighborhood : true
      )
      .filter((r) => (showSavedOnly ? favorites.has(r.id) : true))
      .filter((r) => {
        if (showAllForDay) return true;

        if (timeMode === "now") return isOpenNow(r, now);

        const targetMin = minutesFromHHMM(timeHHMM);
        const start = minutesFromHHMM(r.start_time);
        let end = minutesFromHHMM(r.end_time);
        const crosses = end < start;
        if (crosses) end += 24 * 60;

        const tAdj =
          crosses && targetMin < start ? targetMin + 24 * 60 : targetMin;
        return tAdj >= start && tAdj <= end;
      })
      .sort((a, b) => {
        if (sort === "az") return a.venue_name.localeCompare(b.venue_name);

        const aOpen = isOpenNow(a, now);
        const bOpen = isOpenNow(b, now);

        if (sort === "open") {
          if (aOpen !== bOpen) return aOpen ? -1 : 1;
        }

        const aUntil = minutesUntilStart(a, now);
        const bUntil = minutesUntilStart(b, now);

        if (sort === "soon") {
          const av = aOpen ? -1 : aUntil ?? 99999;
          const bv = bOpen ? -1 : bUntil ?? 99999;
          return av - bv;
        }

        const av = aOpen ? -1 : aUntil ?? 99999;
        const bv = bOpen ? -1 : bUntil ?? 99999;
        if (av !== bv) return av - bv;
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
    sort,
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
          Filter by day, time, and cuisine. Menu links go straight to the
          source.
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
        sort={sort}
        setSort={setSort}
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
              : `${filtered.length} result${
                  filtered.length === 1 ? "" : "s"
                }`}
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
                <tr
                  style={{
                    textAlign: "left",
                    fontSize: 12,
                    color: "#666",
                  }}
                >
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
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {r.venue_name}
                        </span>
                        {r.notes && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#666",
                            }}
                          >
                            {r.notes}
                          </span>
                        )}
                      </div>
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
                    <td style={tdStyle}>{r.type}</td>
                    <td style={tdStyle}>{r.cuisine_tags.join(", ")}</td>
                    <td style={tdStyle}>{r.neighborhood || "—"}</td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
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
        <div>
          Beta: Hours and specials can change quickly. Please confirm details
          with the venue.
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
    return {
      ...base,
      border: "1px solid #d7f0d7",
      background: "#effaf0",
      color: "#1d6b2a",
    };
  }

  if (v.includes("late night")) {
    return {
      ...base,
      border: "1px solid #e0d7f0",
      background: "#f2effa",
      color: "#4b2ca3",
    };
  }

  if (v.includes("taco")) {
    return {
      ...base,
      border: "1px solid #ffe2bf",
      background: "#fff4e5",
      color: "#b15b07",
    };
  }

  // default / other specials
  return {
    ...base,
    border: "1px solid #e0e0e0",
    background: "#f5f5f5",
    color: "#555",
  };
}
