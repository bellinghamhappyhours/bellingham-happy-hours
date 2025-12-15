"use client";

import type React from "react";
import { format12h } from "../lib/time";

// We keep types loose here so they line up with your sheet:
// - day: "Today" or any full day string like "Monday"
// - type: "any", "Food", "Drink", "Food and Drink"
type Props = {
  allCuisines: string[];
  allNeighborhoods: string[];
  day: string | "Today";
  setDay: (v: string | "Today") => void;
  type: string | "any";
  setType: (v: string | "any") => void;
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
  showSavedOnly: boolean;
  setShowSavedOnly: (v: boolean) => void;
};

// Full day names to match your sheet
const DAYS: (string | "Today")[] = [
  "Today",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// 30-minute increments from 11:00 to 01:30 (next day)
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
          onChange={(e) => setDay(e.target.value as string | "Today")}
          style={selectStyle}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
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
          onChange={(e) => setType(e.target.value as string | "any")}
          style={selectStyle}
        >
          <option value="any">Any</option>
          <option value="Food">Food</option>
          <option value="Drink">Drink</option>
          <option value="Food and Drink">Food &amp; Drink</option>
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

      {/* Row 2: Time | Show all for day | Saved only | spacer */}
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
        {/* Radios on one row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 4,
          }}
        >
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
        </div>
        {/* Dropdown below (disabled when "Right now" is selected) */}
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
          Show all for day
        </label>
        <label style={{ fontSize: 12 }}>
          <input
            type="checkbox"
            checked={showAllForDay}
            onChange={(e) => setShowAllForDay(e.target.checked)}
            style={{ marginRight: 4 }}
          />
          Show all
        </label>
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
          Saved only
        </label>
        <label style={{ fontSize: 12 }}>
          <input
            type="checkbox"
            checked={showSavedOnly}
            onChange={(e) => setShowSavedOnly(e.target.checked)}
            style={{ marginRight: 4 }}
          />
          Saved
        </label>
      </div>

      {/* Spacer to balance the 4-column grid */}
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
