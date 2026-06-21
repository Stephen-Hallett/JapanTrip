import { useState } from 'react';
import type { City } from '../types';
import { api } from '../api';
import { JpText } from './JpText';
import { JP_LABELS } from '../data/japanese';

interface Props {
  cities: City[];
  onUpdate: () => void;
}

const PRESET_COLORS = ['#c41e3a', '#2d6a4f', '#e07a00', '#5c4d7d', '#8b6914', '#1d3557', '#e63946', '#457b9d'];

export function CityManager({ cities, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.createCity(name.trim(), color);
      setName('');
      setError('');
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add city');
    }
  };

  const startEdit = (city: City) => {
    setEditingId(city.id);
    setEditName(city.name);
    setEditColor(city.color);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      await api.updateCity(editingId, editName.trim(), editColor);
      setEditingId(null);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this city? Days using it will become unassigned.')) return;
    await api.deleteCity(id);
    onUpdate();
  };

  return (
    <section className="panel city-panel">
      <button
        type="button"
        className="city-panel-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h2>
          <JpText entry={JP_LABELS.cities} /> Cities
        </h2>
        <div className="city-panel-preview">
          {cities.map((c) => (
            <span key={c.id} className="city-dot small" style={{ background: c.color }} title={c.name} />
          ))}
          <span className="city-panel-chevron">{open ? '▴' : '▾'}</span>
        </div>
      </button>

      {open && (
        <div className="city-panel-body">
          <form className="inline-form" onSubmit={handleAdd}>
            <input
              type="text"
              placeholder="City name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="color-picker">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                title="Custom color"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </form>
          {error && <p className="error">{error}</p>}
          <ul className="city-list">
            {cities.map((city) =>
              editingId === city.id ? (
                <li key={city.id} className="city-item editing">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} />
                  <button className="btn btn-sm" onClick={saveEdit}>
                    Save
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </li>
              ) : (
                <li key={city.id} className="city-item">
                  <span className="city-dot" style={{ background: city.color }} />
                  <span className="city-name">{city.name}</span>
                  <button className="btn btn-sm btn-ghost" onClick={() => startEdit(city)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(city.id)}>
                    ×
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </section>
  );
}
