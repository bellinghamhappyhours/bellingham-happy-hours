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
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"

  type: HHType | string;

  deal_label?: string;
  notes?: string;
  last_verified?: string;
};
