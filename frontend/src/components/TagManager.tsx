import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { Tag } from '../types';

interface Props {
  tags: Tag[];
  onUpdate: () => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#c41e3a', '#e07a00', '#2d6a4f', '#1d3557', '#5c4d7d',
  '#8b6914', '#457b9d', '#e63946', '#06a77d', '#d62839',
];

export function TagManager({ tags, onUpdate, onClose }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.createTag(name.trim(), color);
      setName('');
      setError('');
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tag');
    }
  };

  const handleDelete = async (id: number) => {
    await api.deleteTag(id);
    onUpdate();
  };

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="modal-box" role="dialog" aria-modal="true" aria-label="Manage tags">
        <div className="modal-header">
          <h3>🏷 Manage Tags</h3>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="tag-manager-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Tag name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
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
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} title="Custom color" />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Add Tag</button>
        </form>

        {error && <p className="error">{error}</p>}

        {tags.length === 0 ? (
          <p className="empty-hint">No tags yet — add one above.</p>
        ) : (
          <ul className="tag-manager-list">
            {tags.map((tag) => (
              <li key={tag.id} className="tag-manager-item">
                <span className="tag-color-dot" style={{ background: tag.color }} />
                <span className="tag-manager-name">{tag.name}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(tag.id)}
                  aria-label={`Delete ${tag.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
