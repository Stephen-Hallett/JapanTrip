import { useState } from 'react';
import type { Activity, City, Tag } from '../types';
import { api } from '../api';
import { cityNames } from '../hooks/usePlannerData';
import { DraggablePoolItem } from './DraggablePoolItem';
import { JpText } from './JpText';
import { JP_LABELS } from '../data/japanese';
import { TagManager } from './TagManager';

interface Props {
  activities: Activity[];
  cities: City[];
  tags: Tag[];
  onUpdate: () => void;
}

export function ActivityPanel({ activities, cities, tags, onUpdate }: Props) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCities, setSelectedCities] = useState<number[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [filterCity, setFilterCity] = useState<number | 'all'>('all');
  const [filterTag, setFilterTag] = useState<number | 'all'>('all');
  const [showTagManager, setShowTagManager] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCity = (id: number) =>
    setSelectedCities((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const toggleTagSel = (id: number) =>
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createActivity(name.trim(), notes.trim(), selectedCities, selectedTagIds);
    setName('');
    setNotes('');
    setSelectedCities([]);
    setSelectedTagIds([]);
    onUpdate();
  };

  const handleDelete = async (id: number) => {
    await api.deleteActivity(id);
    onUpdate();
  };

  const filtered = activities.filter((a) => {
    const cityOk =
      filterCity === 'all' || a.cityIds.length === 0 || a.cityIds.includes(filterCity as number);
    const tagOk = filterTag === 'all' || a.tagIds.includes(filterTag as number);
    return cityOk && tagOk;
  });

  return (
    <>
      <section className={`panel activity-panel${isExpanded ? ' panel-expanded' : ''}`}>
        <h2>
          <JpText entry={JP_LABELS.activities} /> Activities
          <div className="panel-header-actions">
            <button
              type="button"
              className="btn btn-sm btn-ghost panel-action-btn"
              title="Manage tags"
              onClick={() => setShowTagManager(true)}
            >
              🏷
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost panel-action-btn"
              title={isExpanded ? 'Minimise' : 'Expand'}
              onClick={() => setIsExpanded((v) => !v)}
            >
              {isExpanded ? '⊡' : '⛶'}
            </button>
          </div>
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
          {tags.length > 0 && (
            <div className="tag-selector">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-sel-chip${selectedTagIds.includes(tag.id) ? ' active' : ''}`}
                  style={
                    selectedTagIds.includes(tag.id)
                      ? { background: tag.color, borderColor: tag.color, color: '#fff' }
                      : { borderColor: tag.color, color: tag.color }
                  }
                  onClick={() => toggleTagSel(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
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
            City:
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">All</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {tags.length > 0 && (
            <label>
              Tag:
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="all">All</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <ul className="pool-list">
          {filtered.map((activity) => {
            const cityColor = cities.find((c) => c.id === activity.cityIds[0])?.color;
            const actTags = tags.filter((t) => activity.tagIds.includes(t.id));
            return (
              <li key={activity.id}>
                <DraggablePoolItem
                  type="activity"
                  id={activity.id}
                  name={activity.name}
                  subtitle={cityNames(activity.cityIds, cities)}
                  notes={activity.notes}
                  cityColor={cityColor}
                  tags={actTags}
                  onDelete={() => handleDelete(activity.id)}
                />
              </li>
            );
          })}
          {filtered.length === 0 && <li className="empty-hint">No activities yet — add some above!</li>}
        </ul>
      </section>

      {showTagManager && (
        <TagManager tags={tags} onUpdate={onUpdate} onClose={() => setShowTagManager(false)} />
      )}
    </>
  );
}
