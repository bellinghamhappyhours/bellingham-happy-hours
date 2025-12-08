"use client";

import { DayOfWeek, HHType } from "../lib/types";
import { DAYS, dayLabelFromDate } from "../lib/time";

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

  showAllDay: boolean;
  setShowAllDay: (v: boolean) => void;

  sort: "open" | "soon" | "az";
  setSort: (v: "open" | "soon" | "az") => void;

  showSavedOnly: boolean;
  setShowSavedOnly: (v: boolean) => void;
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function format12h(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${pad2(m)} ${ampm}`;
}

// 11:00 AM -> 1:30 AM, 30-minute steps
function buildTimeOptions() {
  const opts: { value: string; label: string }[] = [];

  // 11:00 -> 23:30
  for (let h = 11; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${pad2(h)}:${pad2(m)}`;
      opts.push({ value, label: format12h(value) });
    }
  }

  // 00:00 -> 01:30
  for (let h = 0; h <= 1; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${pad2(h)}:${pad2(m)}`;
      opts.push({ value, label: format12h(value) });
    }
  }

  return opts;
}

const TIME_OPTIONS = buildTimeOptions();

export default function Filters(props: Props) {
  const today = dayLabelFromDate(new Date());

  return (
    <div style={cardStyle}>
      <div style={gridStyle}>
        <label style={labelStyle}>
          Day
          <select value={props.day} onChange={(e) => props.setDay(e.target.value as any)} style={inputStyle}>
            <option value="Today">Today ({today})</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Type
          <select value={props.type} onChange={(e) => props.setType(e.target.value as any)} style={inputStyle}>
            <option value="any">Any</option>
            <option value="drink">Drink</option>
            <option value="food">Food</option>
            <option value="both">Food & Drink</option>
          </select>
        </label>

        <label style={labelStyle}>
          Cuisine
          <select value={props.cuisine} onChange={(e) => props.setCuisine(e.target.value)} style={inputStyle}>
            <option value="">All</option>
            {props.allCuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Neighborhood
          <select value={props.neighborhood} onChange={(e) => props.setNeighborhood(e.target.value)} style={inputStyle}>
            <option value="">All</option>
            {props.allNeighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Time filter
          <select value={props.timeMode} onChange={(e) => props.setTimeMode(e.target.value as any)} style={inputStyle}>
            <option value="custom">At a time</option>
            <option value="now">Open now</option>
          </select>
        </label>

        <label style={labelStyle}>
          Time
          <select
            disabled={props.timeMode !== "custom"}
            value={props.timeHHMM}
            onChange={(e) => props.setTimeHHMM(e.target.value)}
            style={{ ...inputStyle, opacity: props.timeMode === "custom" ? 1 : 0.5 }}
          >
            {TIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={props.showAllDay}
            onChange={(e) => props.setShowAllDay(e.target.checked)}
          />
          Show all for day
        </label>

        <label style={labelStyle}>
          Sort
          <select value={props.sort} onChange={(e) => props.setSort(e.target.value as any)} style={inputStyle}>
            <option value="open">Open first</option>
            <option value="soon">Starts soon</option>
            <option value="az">A–Z</option>
          </select>
        </label>

        <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={props.showSavedOnly}
            onChange={(e) => props.setShowSavedOnly(e.target.checked)}
          />
          Saved only
        </label>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e6e6e6",
  borderRadius: 12,
  padding: 16,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  color: "#333",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  fontSize: 14,
};
