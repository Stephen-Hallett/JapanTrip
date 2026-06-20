import { useState } from 'react';
import type { City, Food } from '../types';
import { api } from '../api';
import { cityNames } from '../hooks/usePlannerData';
import { DraggablePoolItem } from './DraggablePoolItem';
import { JpText } from './JpText';
import { JP_LABELS } from '../data/japanese';

interface Props {
  foods: Food[];
  cities: City[];
  onUpdate: () => void;
}

export function FoodPanel({ foods, cities, onUpdate }: Props) {
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
    await api.createFood(name.trim(), notes.trim(), selectedCities);
    setName('');
    setNotes('');
    setSelectedCities([]);
    onUpdate();
  };

  const handleDelete = async (id: number) => {
    await api.deleteFood(id);
    onUpdate();
  };

  const filtered =
    filterCity === 'all'
      ? foods
      : foods.filter((f) => f.cityIds.length === 0 || f.cityIds.includes(filterCity));

  return (
    <section className="panel food-panel">
      <h2>
        <JpText entry={JP_LABELS.food} /> Food to Try
      </h2>
      <form className="stack-form" onSubmit={handleAdd}>
        <input type="text" placeholder="Food / restaurant" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
          Add Food
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
        {filtered.map((food) => (
          <li key={food.id}>
            <DraggablePoolItem
              type="food"
              id={food.id}
              name={food.name}
              subtitle={cityNames(food.cityIds, cities)}
              notes={food.notes}
              onDelete={() => handleDelete(food.id)}
            />
          </li>
        ))}
        {filtered.length === 0 && <li className="empty-hint">No food items yet — add some above!</li>}
      </ul>
    </section>
  );
}
