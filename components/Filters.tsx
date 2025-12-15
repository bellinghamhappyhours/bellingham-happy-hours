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

  timeMode: "now" | "custom";
  setTimeMode: (v: "now" | "custom") => void;

  timeHHMM: string;
  setTimeHHMM: (v: string) => void;

  showAllForDay: boolean;
  setShowAllForDay: (v: boolean) => void;

  showSavedOnly: boolean;
  setShowSavedOnly: (v: boolean) => void;
};

// Must match your sheet values exactly for filtering to work.
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

// 30-minute increments from 11:00 AM to 1:30 AM (next day)
function buildTimeOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const start = 11 * 60; // 11:00
  const end = 25 * 60 + 30; // 1:30 next day

  for (let m = start; m <= end; m += 30) {
    const minutesInDay = m % (24 * 60);
    const hh = Math.floor(minutesInDay / 60);
    const mm = minutesInDay % 60;

    const isPM = hh >= 12;
    const h12 = ((hh + 11) % 12) + 1;
    const label = `${h12}:${mm.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`;

    const value = `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
    out.push({ value, label });
  }

  return out;
}

const TIME_OPTIONS = buildTimeOptions();

export default function Filters(props: Props) {
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
    showAllForDay,
    setShowAllForDay,
    showSavedOnly,
    setShowSavedOnly,
  } = props;

  return (
    <div className="filtersCard">
      {/* Row 1: Day / Type / Cuisine / Neighborhood */}
      <div className="row row1">
        <div className="group">
          <div className="label">Day</div>
          <select
            className="select"
            value={day}
            onChange={(e) => setDay(e.target.value as DayOfWeek | "Today")}
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d === "Today" ? "Today" : d}
              </option>
            ))}
          </select>
        </div>

        <div className="group">
          <div className="label">Type</div>
          <select
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value as HHType | "any")}
          >
            <option value="any">Any</option>
            <option value="Food">Food</option>
            <option value="Drink">Drink</option>
            <option value="Food and Drink">Food and Drink</option>
          </select>
        </div>

        <div className="group">
          <div className="label">Cuisine</div>
          <select
            className="select"
            value={cuisine || ""}
            onChange={(e) => setCuisine(e.target.value)}
          >
            <option value="">All</option>
            {allCuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="group">
          <div className="label">Neighborhood</div>
          <select
            className="select"
            value={neighborhood || ""}
            onChange={(e) => setNeighborhood(e.target.value)}
          >
            <option value="">All</option>
            {allNeighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Time / Show All / Saved Only */}
      <div className="row row2">
        <div className="group">
          <div className="label">Time filter</div>

          <div className="timeToggleRow">
            <label className="radioRow">
              <input
                type="radio"
                name="timeMode"
                checked={timeMode === "custom"}
                onChange={() => setTimeMode("custom")}
              />
              <span>At a time</span>
            </label>

            <label className="radioRow">
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
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="group">
          <div className="label">Show all for day</div>
          <label className="checkRow">
            <input
              type="checkbox"
              checked={showAllForDay}
              onChange={(e) => setShowAllForDay(e.target.checked)}
            />
            <span>Show all</span>
          </label>
        </div>

        <div className="group">
          <div className="label">Saved only</div>
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

      <style jsx>{`
        .filtersCard {
          background: white;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          padding: 16px;
        }

        .row {
          display: grid;
          gap: 14px;
        }

        /* Desktop/tablet layout */
        .row1 {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .row2 {
          margin-top: 14px;
          grid-template-columns: minmax(260px, 1.3fr) minmax(180px, 1fr) minmax(180px, 1fr);
          align-items: start;
        }

        .group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .label {
          font-size: 14px;
          font-weight: 600;
          color: #111;
        }

        .select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #d6d6d6;
          background: white;
          font-size: 14px;
          min-width: 0;
        }

        .timeToggleRow {
          display: flex;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
        }

        .radioRow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #111;
        }

        .checkRow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #111;
        }

        /* Mobile: stack everything vertically so nothing is off-screen */
        @media (max-width: 720px) {
          .row1 {
            grid-template-columns: 1fr;
          }

          .row2 {
            grid-template-columns: 1fr;
          }

          .timeToggleRow {
            gap: 14px;
          }
        }
      `}</style>
    </div>
  );
}
