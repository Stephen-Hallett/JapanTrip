import { useDroppable } from '@dnd-kit/core';
import type { City, DayPlan } from '../types';
import { FLIGHT_INFO, TRIP_END, TRIP_START } from '../types';
import { api } from '../api';
import { AccommodationBlock } from './AccommodationBlock';
import { DayItemChip } from './DayItemChip';
import { JpText } from './JpText';
import { JP_LABELS } from '../data/japanese';

interface Props {
  day: DayPlan;
  cities: City[];
  onUpdate: () => void;
}

function formatDate(dateStr: string): { dayNum: number; weekday: string } {
  const d = new Date(dateStr + 'T12:00:00');
  return {
    dayNum: d.getDate(),
    weekday: d.toLocaleDateString('en-NZ', { weekday: 'short' }),
  };
}

export function CalendarDay({ day, cities, onUpdate }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.date}`,
    data: { date: day.date },
  });

  const { dayNum, weekday } = formatDate(day.date);
  const flight = FLIGHT_INFO[day.date];
  const bgColor = day.cityColor ? `${day.cityColor}18` : 'var(--day-bg)';
  const borderColor = day.cityColor || 'var(--border)';

  const handleCityChange = async (cityId: string) => {
    await api.updateDayCity(day.date, cityId === '' ? null : Number(cityId));
    onUpdate();
  };

  const handleRemoveItem = async (id: number) => {
    await api.removeDayItem(id);
    onUpdate();
  };

  return (
    <div
      ref={setNodeRef}
      className={`calendar-day ${isOver ? 'drop-over' : ''} ${flight ? 'flight-day' : ''}`}
      style={{
        background: bgColor,
        borderColor,
        boxShadow: day.cityColor ? `inset 0 4px 0 ${day.cityColor}` : 'inset 0 4px 0 var(--border)',
      }}
    >
      <div className="day-header">
        <div className="day-date">
          <span className="day-weekday">{weekday}</span>
          <span className="day-num">{dayNum}</span>
        </div>
        <select
          className="day-city-select"
          value={day.cityId ?? ''}
          onChange={(e) => handleCityChange(e.target.value)}
        >
          <option value="">— city —</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <AccommodationBlock
        date={day.date}
        name={day.accommodationName}
        details={day.accommodationDetails}
        onUpdate={onUpdate}
      />

      {flight && <div className="flight-banner">{flight}</div>}

      {day.cityName && (
        <div className="day-city-label" style={{ color: day.cityColor || undefined }}>
          📍 {day.cityName}
        </div>
      )}

      <div className="day-items">
        {day.items.map((item) => (
          <DayItemChip key={item.id} item={item} onRemove={() => handleRemoveItem(item.id)} />
        ))}
        {day.items.length === 0 && <span className="drop-hint">Drop here</span>}
      </div>
    </div>
  );
}

function buildTripWeeks(): string[][] {
  const weeks: string[][] = [];
  const start = new Date(TRIP_START + 'T12:00:00');
  const end = new Date(TRIP_END + 'T12:00:00');

  let current: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    current.push(d.toISOString().slice(0, 10));
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    while (current.length < 7) current.push('');
    weeks.push(current);
  }
  return weeks;
}

interface CalendarProps {
  days: DayPlan[];
  cities: City[];
  onUpdate: () => void;
}

export function TripCalendar({ days, cities, onUpdate }: CalendarProps) {
  const weeks = buildTripWeeks();
  const dayMap = new Map(days.map((d) => [d.date, d]));
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <section className="panel calendar-panel">
      <h2>
        <JpText entry={JP_LABELS.trip} /> Trip Calendar
      </h2>
      <p className="calendar-subtitle">
        7 – 23 September 2026 · Drag activities & food onto each day
      </p>

      <div className="calendar-legend">
        {cities.map((c) => (
          <span key={c.id} className="legend-item">
            <span className="city-dot" style={{ background: c.color }} />
            {c.name}
          </span>
        ))}
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {weekdays.map((w) => (
            <div key={w} className="weekday-header">
              {w}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="calendar-week">
            {week.map((date, di) => {
              if (!date) {
                return <div key={`empty-${wi}-${di}`} className="calendar-day empty-day" />;
              }
              const plan = dayMap.get(date);
              if (!plan) return null;
              return <CalendarDay key={date} day={plan} cities={cities} onUpdate={onUpdate} />;
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
