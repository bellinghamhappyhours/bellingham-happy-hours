// lib/types.ts
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type HHType = "food" | "drink" | "both";

export type HappyHourRow = {
  id: string;
  venue_name: string;
  neighborhood?: string;
  cuisine_tags: string[];
  menu_url: string;
  website_url?: string;
  day_of_week: DayOfWeek;
  start_time: string; // "HH:MM" 24h
  end_time: string;   // "HH:MM" 24h
  type: HHType;
  notes?: string;
  last_verified?: string;
  deal_label?: string; // e.g. "Happy Hour", "Late Night", "Taco Tuesday"
};
