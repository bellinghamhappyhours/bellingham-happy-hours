export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type HHType = "food" | "drink" | "both";

export type HappyHourRow = {
  id: string;
  venue_name: string;
  neighborhood: string;
  cuisine_tags: string[];
  menu_url: string;
  website_url: string;
  day_of_week: DayOfWeek;
  start_time: string; // "HH:MM" 24h
  end_time: string;   // "HH:MM" 24h

  // Stored internally as lowercase, but we’ll parse your Sheet values like "Food"/"Drink"/"Both"
  type: HHType;

  // Label (not filterable unless you want later)
  deal_label?: string;

  notes?: string;
  last_verified?: string; // "YYYY-MM-DD"
};
