export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type HHType = "Food" | "Drink" | "Food and Drink";

export type HappyHourRow = {
  id: string;
  venue_name: string;
  neighborhood: string;
  cuisine_tags: string[];
  menu_url: string;
  website_url?: string;

  day_of_week: DayOfWeek;

  // Deal window start/end can be "HH:MM" OR the keywords "Open" / "Close"
  start_time: string;
  end_time: string;

  // Only used when start_time === "Open" or end_time === "Close"
  open_time?: string; // "HH:MM"
  close_time?: string; // "HH:MM"

  type: HHType | string;

  deal_label?: string;
  notes?: string;
  last_verified?: string;
};
