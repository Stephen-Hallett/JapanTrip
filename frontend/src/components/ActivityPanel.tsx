import { useState } from 'react';
import type { Activity, City } from '../types';
import { api } from '../api';
import { cityNames } from '../hooks/usePlannerData';
import { DraggablePoolItem } from './DraggablePoolItem';
import { JpText } from './JpText';
import { JP_LABELS } from '../data/japanese';

interface Props {
  activities: Activity[];
  cities: City[];
  onUpdate: () => void;
}

export function ActivityPanel({ activities, cities, onUpdate }: Props) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCities, setSelectedCities] = useState<number[]>([]);
  const [filterCity, setFilterCity] = useState<number | 'all'>('all');

  const toggleCity = (id: number) => {
    setSelectedCities((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createActivity(name.trim(), notes.trim(), selectedCities);
    setName('');
    setNotes('');
    setSelectedCities([]);
    onUpdate();
  };

  const handleDelete = async (id: number) => {
    await api.deleteActivity(id);
    onUpdate();
  };

  const filtered =
    filterCity === 'all'
      ? activities
      : activities.filter((a) => a.cityIds.length === 0 || a.cityIds.includes(filterCity));

  return (
    <section className="panel activity-panel">
      <h2>
        <JpText entry={JP_LABELS.activities} /> Activities
      </h2>
      <form className="stack-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Activity name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="city-checkboxes">
          {cities.map((c) => (
            <label key={c.id} className="city-check">
              <input
                type="checkbox"
                checked={selectedCities.includes(c.id)}
                onChange={() => toggleCity(c.id)}
              />
              <span className="city-dot small" style={{ background: c.color }} />
              {c.name}
            </label>
          ))}
        </div>
        <button type="submit" className="btn btn-primary">
          Add Activity
        </button>
      </form>

      <div className="filter-bar">
        <label>
          Filter:
          <select value={filterCity} onChange={(e) => setFilterCity(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="pool-list">
        {filtered.map((activity) => (
          <li key={activity.id}>
            <DraggablePoolItem
              type="activity"
              id={activity.id}
              name={activity.name}
              subtitle={cityNames(activity.cityIds, cities)}
              notes={activity.notes}
              onDelete={() => handleDelete(activity.id)}
            />
          </li>
        ))}
        {filtered.length === 0 && <li className="empty-hint">No activities yet — add some above!</li>}
      </ul>
    </section>
  );
}
