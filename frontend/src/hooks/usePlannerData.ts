import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { Activity, City, DayPlan, Food } from '../types';

export function usePlannerData() {
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [days, setDays] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [c, a, f, d] = await Promise.all([
        api.getCities(),
        api.getActivities(),
        api.getFoods(),
        api.getDays(),
      ]);
      setCities(c);
      setActivities(a);
      setFoods(f);
      setDays(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    cities,
    activities,
    foods,
    days,
    loading,
    error,
    refresh,
    setCities,
    setActivities,
    setFoods,
    setDays,
  };
}

export function cityNames(cityIds: number[], cities: City[]): string {
  return cityIds
    .map((id) => cities.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(', ');
}
