export interface City {
  id: number;
  name: string;
  color: string;
}

export interface Activity {
  id: number;
  name: string;
  notes: string;
  cityIds: number[];
}

export interface Food {
  id: number;
  name: string;
  notes: string;
  cityIds: number[];
}

export interface DayItem {
  id: number;
  date: string;
  itemType: 'activity' | 'food';
  itemId: number;
  sortOrder: number;
  name: string;
}

export interface DayPlan {
  date: string;
  cityId: number | null;
  cityName: string | null;
  cityColor: string | null;
  accommodationName: string;
  accommodationDetails: string;
  items: DayItem[];
}

export const TRIP_START = '2026-09-07';
export const TRIP_END = '2026-09-23';
export const TRIP_YEAR = 2026;
export const TRIP_MONTH = 9;

export const FLIGHT_INFO: Record<string, string> = {
  '2026-09-07': '✈ Fly out · Arrive NRT 17:40',
  '2026-09-23': '✈ Depart KIX 21:25',
};

export type DragItem = {
  type: 'activity' | 'food';
  id: number;
  name: string;
  source: 'pool' | 'day';
  dayItemId?: number;
  date?: string;
};
