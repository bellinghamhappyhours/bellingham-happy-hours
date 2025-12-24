"use client";

import type React from "react";
import type { DayOfWeek, HHType } from "../lib/types";

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

  timeMode: "custom" | "now";
  setTimeMode: (v: "custom" | "now") => void;

  timeHHMM: string;
  setTimeHHMM: (v: string) => void;

  showAllForDay: boolean;
  setShowAllForDay: (v: boolean) => void;

  showSavedOnly: boolean;
  setShowSavedOnly: (v: boolean) => void;
};

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

const TYPES: (HHType | "any")[] = ["any", "Food", "Drink", "Food and Drink"];

function labelDay(d: DayOfWeek | "Today") {
  if (d === "Today") return "Today";
  return d;
}

function format12hFromHHMM(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":");
  const h24 = Number(hStr);
  const m = Number(mStr);
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(m).padStart(2, "0");
  return `${h12}:${mm} ${suffix}`;
}

// 30-minute increments from 11:00 to 1:30 AM (next day)
function buildTimeOptions(): string[] {
  const start = 11 * 60; // 11:00
  const end = 25 * 60 + 30; // 1:30 AM next day
  const out: string[] = [];

  for (let t = start; t <= end; t += 30) {
    let mins = t;
    if (mins >= 24 * 60) mins -= 24 * 60;

    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    out.push(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }

  return out;
}

const TIME_OPTIONS = buildTimeOptions();

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
    <section className="filtersCard">
      {/* Row 1: Day / Type / Cuisine / Neighborhood */}
      <div className="filtersRowTop">
        <div className="field">
          <label className="fieldLabel">Day</label>
          <select
            className="select"
            value={day}
            onChange={(e) => setDay(e.target.value as DayOfWeek | "Today")}
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {labelDay(d)}
              </option>
            ))}
          </select>
        </div>

{/* Type filter temporarily hidden until dataset grows */}
{/*
        <div className="field">
          <label className="fieldLabel">Type</label>
          <select
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value as HHType | "any")}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "any" ? "Any" : t}
              </option>
            ))}
          </select>
        </div>
*/}

        <div className="field">
          <label className="fieldLabel">Cuisine</label>
          <select
            className="select"
            value={cuisine || "any"}
            onChange={(e) => setCuisine(e.target.value === "any" ? "" : e.target.value)}
          >
            <option value="any">Any</option>
            {allCuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="fieldLabel">Neighborhood</label>
          <select
            className="select"
            value={neighborhood || "any"}
            onChange={(e) => setNeighborhood(e.target.value === "any" ? "" : e.target.value)}
          >
            <option value="any">Any</option>
            {allNeighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Time filter + show all + saved */}
      <div className="filtersRowBottom">
        <div className="field">
          <label className="fieldLabel">Time filter</label>

          <div className="radioRow">
            <label className="radioItem">
              <input
                type="radio"
                name="timeMode"
                checked={timeMode === "custom"}
                onChange={() => setTimeMode("custom")}
              />
              <span>At a time</span>
            </label>

            <label className="radioItem">
              <input
                type="radio"
                name="timeMode"
                checked={timeMode === "now"}
                onChange={() => setTimeMode("now")}
              />
              <span>Right now</span>
            </label>
          </div>

          <select
            className="select"
            value={timeHHMM}
            onChange={(e) => setTimeHHMM(e.target.value)}
            disabled={timeMode === "now"}
            aria-disabled={timeMode === "now"}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {format12hFromHHMM(t)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="fieldLabel">Show all for day</label>
          <label className="checkRow">
            <input
              type="checkbox"
              checked={showAllForDay}
              onChange={(e) => setShowAllForDay(e.target.checked)}
            />
            <span>Show all</span>
          </label>
        </div>

        <div className="field">
          <label className="fieldLabel">Saved only</label>
          <label className="checkRow">
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
