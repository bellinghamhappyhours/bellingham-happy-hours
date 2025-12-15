// lib/types.ts

// Day names exactly as they appear in the sheet
export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

// Allow both the new labels and any older lowercase/both values
export type HHType =
  | "Food"
  | "Drink"
  | "Food and Drink"
  | "food"
  | "drink"
  | "both";

// One row from the Google Sheet, after parsing
export type HappyHourRow = {
  id: string;

  venue_name: string;
  neighborhood?: string;

  // Split from the comma-separated `cuisine_tags` column
  cuisine_tags: string[];

  menu_url: string;
  website_url?: string;

  day_of_week: DayOfWeek;

  // "HH:MM" 24-hour strings
  start_time: string;
  end_time: string;

  type: HHType | string;

  // e.g. "Happy Hour", "Late Night", "Taco Tuesday"
  deal_label?: string;

  // Freeform notes from the sheet
  notes?: string;

  // YYYY-MM-DD, optional
  last_verified?: string;
};
