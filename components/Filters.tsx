"use client";

import React from "react";
import type { DayOfWeek, HHType } from "../lib/types";

type FiltersProps = {
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

  sort: "open" | "soon" | "az";
  setSort: (v: "open" | "soon" | "az") => void;

  showAllForDay: boolean;
  setShowAllForDay: (v: boolean) => void;

  showSavedOnly: boolean;
  setShowSavedOnly: (v: boolean) => void;
};

// For the Day dropdown in the UI
const DAYS: (DayOfWeek | "Today")[] = [
  "Today",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function labelForDay(option: DayOfWeek | "Today") {
  if (option !== "Today") return option;
  const now = new Date();
  const name = DAY_NAMES[now.getDay()];
  const short = name.slice(0, 3);
  return `Today (${short})`;
}

function formatMinutes(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  const mm = m.toString().padStart(2, "0");
  return `${h12}:${mm} ${ampm}`;
}

// 30-minute increments from 11:00 AM to 1:30 AM
const timeOptions: { value: string; label: string }[] = (() => {
  const out: { value: string; label: string }[] = [];

  const push = (h24: number, m: number) => {
    const value =
      h24.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0");
    out.push({ value, label: formatMinutes(h24 * 60 + m) });
  };

  // 11:00–23:30
  for (let h = 11; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      push(h, m);
    }
  }

  // 00:00, 00:30, 01:00, 01:30
  const late: [number, number][] = [
    [0, 0],
    [0, 30],
    [1, 0],
    [1, 30],
  ];
  late.forEach(([h, m]) => push(h, m));

  return out;
})();

export default function Filters(props: FiltersProps) {
  const {
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
    sort,
    setSort,
    showAllForDay,
    setShowAllForDay,
    showSavedOnly,
    setShowSavedOnly,
  } = props;

  const isNow = timeMode === "now";

  return (
    <section className="filters">
      {/* Top row: day / type / cuisine / neighborhood */}
      <div className="filters-row filters-row-top">
        <div className="filter-block">
          <label className="filter-label">Day</label>
          <select
            className="filter-select"
            value={day}
            onChange={(e) => setDay(e.target.value as DayOfWeek | "Today")}
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {labelForDay(d)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-block">
          <label className="filter-label">Type</label>
          <select
            className="filter-select"
            value={type}
            onChange={(e) =>
              setType(
                e.target.value === "any"
                  ? "any"
                  : (e.target.value as HHType)
              )
            }
          >
            <option value="any">Any</option>
            <option value="Food">Food</option>
            <option value="Drink">Drink</option>
            <option value="Food and Drink">Food &amp; Drink</option>
          </select>
        </div>

        <div className="filter-block">
          <label className="filter-label">Cuisine</label>
          <select
            className="filter-select"
            value={cuisine || ""}
            onChange={(e) => setCuisine(e.target.value)}
          >
            <option value="">Any</option>
            {allCuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-block">
          <label className="filter-label">Neighborhood</label>
          <select
            className="filter-select"
            value={neighborhood || ""}
            onChange={(e) => setNeighborhood(e.target.value)}
          >
            <option value="">Any</option>
            {allNeighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom row: time / show-all / sort / saved */}
      <div className="filters-row filters-row-bottom">
        {/* Time */}
        <div className="filter-block">
          <label className="filter-label">Time</label>
          <div className="filter-radio-row">
            <label className="filter-radio-option">
              <input
                type="radio"
                name="timeMode"
                value="custom"
                checked={timeMode === "custom"}
                onChange={() => setTimeMode("custom")}
              />
              <span>At a time</span>
            </label>
            <label className="filter-radio-option">
              <input
                type="radio"
                name="timeMode"
                value="now"
                checked={timeMode === "now"}
                onChange={() => setTimeMode("now")}
              />
              <span>Right now</span>
            </label>
          </div>
          <select
            className="filter-select"
            value={timeHHMM}
            disabled={isNow}
            onChange={(e) => setTimeHHMM(e.target.value)}
          >
            {timeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Show all for day */}
        <div className="filter-block">
          <label className="filter-label">Show all for day</label>
          <label className="filter-checkbox-row">
            <input
              type="checkbox"
              checked={showAllForDay}
              onChange={(e) => setShowAllForDay(e.target.checked)}
            />
            <span>Show all</span>
          </label>
        </div>

        {/* Sort */}
        <div className="filter-block">
          <label className="filter-label">Sort</label>
          <select
            className="filter-select"
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "open" | "soon" | "az")
            }
          >
            <option value="open">Open now first</option>
            <option value="soon">Starting soon first</option>
            <option value="az">A–Z</option>
          </select>
        </div>

        {/* Saved only */}
        <div className="filter-block">
          <label className="filter-label">Saved only</label>
          <label className="filter-checkbox-row">
            <input
              type="checkbox"
              checked={showSavedOnly}
              onChange={(e) => setShowSavedOnly(e.target.checked)}
            />
            <span>Saved</span>
          </label>
        </div>
      </div>
    </section>
  );
}
