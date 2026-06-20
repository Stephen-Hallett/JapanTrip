import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { JpText } from './JpText';
import { JP_LABELS } from '../data/japanese';

interface Props {
  date: string;
  name: string;
  details: string;
  onUpdate: () => void;
}

export function AccommodationBlock({ date, name, details, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDetails, setEditDetails] = useState(details);
  const [saving, setSaving] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditName(name);
    setEditDetails(details);
  }, [name, details]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateDayAccommodation(date, editName.trim(), editDetails.trim());
      setOpen(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await api.updateDayAccommodation(date, '', '');
      setEditName('');
      setEditDetails('');
      setOpen(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="accommodation-block" ref={popoverRef}>
      <button
        type="button"
        className={`accommodation-trigger ${name ? 'has-name' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="accommodation-icon">🏨</span>
        <span className="accommodation-name">
          {name || (
            <>
              <JpText entry={JP_LABELS.lodging} className="accommodation-jp" /> — add stay
            </>
          )}
        </span>
        <span className="accommodation-chevron">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="accommodation-popover">
          <label className="accommodation-field">
            <span>Name</span>
            <input
              type="text"
              placeholder="Hotel / Airbnb name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
            />
          </label>
          <label className="accommodation-field">
            <span>Details</span>
            <textarea
              placeholder="Address, check-in time, confirmation #, room type…"
              value={editDetails}
              onChange={(e) => setEditDetails(e.target.value)}
              rows={4}
            />
          </label>
          <div className="accommodation-actions">
            <button type="button" className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            {(name || details) && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={handleClear} disabled={saving}>
                Clear
              </button>
            )}
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {name && details && !open && (
        <div className="accommodation-preview" title={details}>
          {details.split('\n')[0]}
        </div>
      )}
    </div>
  );
}
