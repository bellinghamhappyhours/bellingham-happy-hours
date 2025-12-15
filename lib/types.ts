// lib/types.ts

// Single happy hour row from the Google Sheet
export type HappyHourRow = {
  id: string;              // synthetic id we create in the API
  venue_name: string;
  neighborhood: string;
  cuisine_tags: string[];  // split on commas from the sheet
  menu_url: string;
  website_url?: string;
  day_of_week: string;     // e.g. "Monday"
  start_time: string;      // "HH:MM" 24-hour, e.g. "15:00"
  end_time: string;        // "HH:MM" 24-hour
  type: string;            // e.g. "Food", "Drink", "Food and Drink"
  deal_label?: string;     // e.g. "Happy Hour", "Late Night"
  notes?: string;
  last_verified?: string;  // e.g. "2025-12-07"
};
