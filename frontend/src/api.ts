import type { Activity, City, DayItem, DayPlan, Food, Tag } from './types';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getCities: () => request<City[]>('/cities'),
  createCity: (name: string, color: string) =>
    request<City>('/cities', { method: 'POST', body: JSON.stringify({ name, color }) }),
  updateCity: (id: number, name: string, color: string) =>
    request<City>(`/cities/${id}`, { method: 'PUT', body: JSON.stringify({ name, color }) }),
  deleteCity: (id: number) => request<void>(`/cities/${id}`, { method: 'DELETE' }),

  getTags: () => request<Tag[]>('/tags'),
  createTag: (name: string, color: string) =>
    request<Tag>('/tags', { method: 'POST', body: JSON.stringify({ name, color }) }),
  updateTag: (id: number, name: string, color: string) =>
    request<Tag>(`/tags/${id}`, { method: 'PUT', body: JSON.stringify({ name, color }) }),
  deleteTag: (id: number) => request<void>(`/tags/${id}`, { method: 'DELETE' }),

  getActivities: () => request<Activity[]>('/activities'),
  createActivity: (name: string, notes: string, cityIds: number[], tagIds: number[]) =>
    request<Activity>('/activities', { method: 'POST', body: JSON.stringify({ name, notes, cityIds, tagIds }) }),
  updateActivity: (id: number, name: string, notes: string, cityIds: number[], tagIds: number[]) =>
    request<Activity>(`/activities/${id}`, { method: 'PUT', body: JSON.stringify({ name, notes, cityIds, tagIds }) }),
  deleteActivity: (id: number) => request<void>(`/activities/${id}`, { method: 'DELETE' }),

  getFoods: () => request<Food[]>('/foods'),
  createFood: (name: string, notes: string, cityIds: number[]) =>
    request<Food>('/foods', { method: 'POST', body: JSON.stringify({ name, notes, cityIds }) }),
  updateFood: (id: number, name: string, notes: string, cityIds: number[]) =>
    request<Food>(`/foods/${id}`, { method: 'PUT', body: JSON.stringify({ name, notes, cityIds }) }),
  deleteFood: (id: number) => request<void>(`/foods/${id}`, { method: 'DELETE' }),

  getDays: () => request<DayPlan[]>('/days'),
  updateDayCity: (date: string, cityId: number | null) =>
    request<DayPlan>(`/days/${date}/city`, { method: 'PUT', body: JSON.stringify({ cityId }) }),
  updateDayAccommodation: (date: string, accommodationName: string, accommodationDetails: string) =>
    request<DayPlan>(`/days/${date}/accommodation`, {
      method: 'PUT',
      body: JSON.stringify({ accommodationName, accommodationDetails }),
    }),
  addDayItem: (date: string, itemType: 'activity' | 'food', itemId: number) =>
    request<DayItem>(`/days/${date}/items`, { method: 'POST', body: JSON.stringify({ itemType, itemId }) }),
  removeDayItem: (id: number) => request<void>(`/day-items/${id}`, { method: 'DELETE' }),
  reorderDayItems: (date: string, itemIds: number[]) =>
    request<DayPlan>(`/days/${date}/reorder`, { method: 'PUT', body: JSON.stringify({ itemIds }) }),
};
