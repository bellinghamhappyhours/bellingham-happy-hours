"use client";

import type React from "react";
import { DayOfWeek, HHType } from "../lib/types";
import { format12h } from "../lib/time";

type Props = {
  allCuisines: string[];
  allNeighborhoods: string[];
  day: DayOfWeek | "Today";
  setDay: (v: DayOfWeek | "Today") => void;
  type: HHType | "any";
  setType: (v: HHType | "any") => void;
  cuisine: string;
  setCuisine: (v: string) => void;
  neighborhood: string;
  setNeighborhood: (v: string) => void;
  timeMode: "now" | "custom";
  setTimeMode: (v: "now" | "custom") => void;
  timeHHMM: string;
  setTimeHHMM: (v: string) => void;
  showAllForDay: boolean;
  setShowAllForDay: (v: boolean) => void;
  sort: "open" | "soon" | "az";
  setSort: (v: "open" | "soon" | "az") => void;
  showSavedOnly: boolean;
  setShowSavedOnly: (v: boolean) => void;
};

const DAYS: (DayOfWeek | "Today")[] = [
  "Today",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

// 30-minute increments from 11:00 to 01:30 next day
const timeOptions: { value: string; label: string }[] = (() => {
  const out: { value: string; label: string }[] = [];
  let minutes = 11 * 60; // 11:00
  const endMinutes = 24 * 60 + 1 * 60 + 30; // 01:30 next day

  while (minutes <= endMinutes) {
    let mins = minutes;
    if (mins >= 24 * 60) mins -= 24 * 60;

    const hh = String(Math.floor(mins / 60)).padStart(2, "0");
    const mm = String(mins % 60).padStart(2, "0");
    const value = `${hh}:${mm}`;

    out.push({ value, label: format12h(value) });
    minutes += 30;
  }

  return out;
})();

export default function Filters({
  allCuisines,
  allNeighborhoods,
  day,
  setDay,
  type,
  setType,
  cuisine,
  setCuisine,
  neighborhood,
  setNeighborhood,
  timeMode,
  setTimeMode,
  timeHHMM,
  setTimeHHMM,
  showAllForDay,
  setShowAllForDay,
  sort,
  setSort,
  showSavedOnly,
  setShowSavedOnly,
}: Props) {
  return (
    <section
      style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
        alignItems: "flex-end",
      }}
    >
      {/* Row 1: Day, Type, Cuisine, Neighborhood */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Day
        </label>
        <select
          value={day}
          onChange={(e) => setDay(e.target.value as DayOfWeek | "Today")}
          style={selectStyle}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d === "Today" ? "Today" : d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as HHType | "any")}
          style={selectStyle}
        >
          <option value="any">Any</option>
          <option value="food">Food</option>
          <option value="drink">Drink</option>
          <option value="both">Food &amp; Drink</option>
        </select>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Cuisine
        </label>
        <select
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          style={selectStyle}
        >
          <option value="">Any</option>
          {allCuisines.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Neighborhood
        </label>
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          style={selectStyle}
        >
          <option value="">Any</option>
          {allNeighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Row 2: Time (under Day), Sort (under Type), Saved / Show all under Cuisine/Neighborhood area */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Time
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12 }}>
            <input
              type="radio"
              name="timeMode"
              value="custom"
              checked={timeMode === "custom"}
              onChange={() => setTimeMode("custom")}
              style={{ marginRight: 4 }}
            />
            At a time
          </label>
          <select
            value={timeHHMM}
            onChange={(e) => setTimeHHMM(e.target.value)}
            style={selectStyle}
            disabled={timeMode !== "custom"}
          >
            {timeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <label style={{ fontSize: 12 }}>
            <input
              type="radio"
              name="timeMode"
              value="now"
              checked={timeMode === "now"}
              onChange={() => setTimeMode("now")}
              style={{ marginRight: 4 }}
            />
            Right now
          </label>
          <label style={{ fontSize: 12, marginTop: 4 }}>
            <input
              type="checkbox"
              checked={showAllForDay}
              onChange={(e) => setShowAllForDay(e.target.checked)}
              style={{ marginRight: 4 }}
            />
            Show all for day
          </label>
        </div>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Sort
        </label>
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as "open" | "soon" | "az")
          }
          style={selectStyle}
        >
          <option value="open">Happening now first</option>
          <option value="soon">Starting soon first</option>
          <option value="az">A–Z by place</option>
        </select>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Saved
        </label>
        <label style={{ fontSize: 12 }}>
          <input
            type="checkbox"
            checked={showSavedOnly}
            onChange={(e) => setShowSavedOnly(e.target.checked)}
            style={{ marginRight: 4 }}
          />
          Saved only
        </label>
      </div>

      {/* Empty spacer to keep grid clean on wide screens */}
      <div />
    </section>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 13,
  background: "white",
};
