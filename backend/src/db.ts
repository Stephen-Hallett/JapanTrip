import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'japan-planner.db');

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#c41e3a'
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS activity_cities (
      activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      PRIMARY KEY (activity_id, city_id)
    );

    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS food_cities (
      food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      PRIMARY KEY (food_id, city_id)
    );

    CREATE TABLE IF NOT EXISTS day_plans (
      date TEXT PRIMARY KEY,
      city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
      accommodation_name TEXT DEFAULT '',
      accommodation_details TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS day_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      item_type TEXT NOT NULL CHECK (item_type IN ('activity', 'food')),
      item_id INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      UNIQUE (date, item_type, item_id)
    );
  `);

  migrateDayPlansColumns();
  migrateTagsTables();

  const cityCount = db.prepare('SELECT COUNT(*) as count FROM cities').get() as { count: number };
  if (cityCount.count === 0) {
    const insert = db.prepare('INSERT INTO cities (name, color) VALUES (?, ?)');
    const defaults = [
      ['Tokyo', '#c41e3a'],
      ['Kyoto', '#2d6a4f'],
      ['Osaka', '#e07a00'],
      ['Hakone', '#5c4d7d'],
      ['Nara', '#8b6914'],
    ];
    for (const [name, color] of defaults) {
      insert.run(name, color);
    }
  }

  const dayCount = db.prepare('SELECT COUNT(*) as count FROM day_plans').get() as { count: number };
  if (dayCount.count === 0) {
    const tokyo = db.prepare('SELECT id FROM cities WHERE name = ?').get('Tokyo') as { id: number };
    const osaka = db.prepare('SELECT id FROM cities WHERE name = ?').get('Osaka') as { id: number };
    const insertDay = db.prepare('INSERT INTO day_plans (date, city_id) VALUES (?, ?)');

    for (let day = 7; day <= 23; day++) {
      const date = `2026-09-${String(day).padStart(2, '0')}`;
      if (day <= 12) {
        insertDay.run(date, tokyo.id);
      } else if (day <= 20) {
        insertDay.run(date, null);
      } else {
        insertDay.run(date, osaka.id);
      }
    }
  }
}

export interface City {
  id: number;
  name: string;
  color: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Activity {
  id: number;
  name: string;
  notes: string;
  cityIds: number[];
  tagIds: number[];
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

function migrateDayPlansColumns() {
  const cols = db.prepare('PRAGMA table_info(day_plans)').all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  if (!names.has('accommodation_name')) {
    db.exec(`ALTER TABLE day_plans ADD COLUMN accommodation_name TEXT DEFAULT ''`);
  }
  if (!names.has('accommodation_details')) {
    db.exec(`ALTER TABLE day_plans ADD COLUMN accommodation_details TEXT DEFAULT ''`);
  }
}

function migrateTagsTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#c41e3a'
    );

    CREATE TABLE IF NOT EXISTS activity_tags (
      activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (activity_id, tag_id)
    );
  `);
}

function getCityIds(table: 'activity_cities' | 'food_cities', itemCol: string, itemId: number): number[] {
  const rows = db
    .prepare(`SELECT city_id FROM ${table} WHERE ${itemCol} = ?`)
    .all(itemId) as { city_id: number }[];
  return rows.map((r) => r.city_id);
}

function getTagIds(activityId: number): number[] {
  const rows = db
    .prepare('SELECT tag_id FROM activity_tags WHERE activity_id = ?')
    .all(activityId) as { tag_id: number }[];
  return rows.map((r) => r.tag_id);
}

export function getCities(): City[] {
  return db.prepare('SELECT id, name, color FROM cities ORDER BY name').all() as City[];
}

export function createCity(name: string, color: string): City {
  const result = db.prepare('INSERT INTO cities (name, color) VALUES (?, ?)').run(name, color);
  return { id: Number(result.lastInsertRowid), name, color };
}

export function updateCity(id: number, name: string, color: string): City | null {
  const result = db.prepare('UPDATE cities SET name = ?, color = ? WHERE id = ?').run(name, color, id);
  if (result.changes === 0) return null;
  return { id, name, color };
}

export function deleteCity(id: number): boolean {
  const result = db.prepare('DELETE FROM cities WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getTags(): Tag[] {
  return db.prepare('SELECT id, name, color FROM tags ORDER BY name').all() as Tag[];
}

export function createTag(name: string, color: string): Tag {
  const result = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)').run(name, color);
  return { id: Number(result.lastInsertRowid), name, color };
}

export function updateTag(id: number, name: string, color: string): Tag | null {
  const result = db.prepare('UPDATE tags SET name = ?, color = ? WHERE id = ?').run(name, color, id);
  if (result.changes === 0) return null;
  return { id, name, color };
}

export function deleteTag(id: number): boolean {
  const result = db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getActivities(): Activity[] {
  const rows = db.prepare('SELECT id, name, notes FROM activities ORDER BY name').all() as {
    id: number;
    name: string;
    notes: string;
  }[];
  return rows.map((r) => ({
    ...r,
    cityIds: getCityIds('activity_cities', 'activity_id', r.id),
    tagIds: getTagIds(r.id),
  }));
}

export function createActivity(name: string, notes: string, cityIds: number[], tagIds: number[]): Activity {
  const result = db.prepare('INSERT INTO activities (name, notes) VALUES (?, ?)').run(name, notes);
  const id = Number(result.lastInsertRowid);
  const insertCity = db.prepare('INSERT INTO activity_cities (activity_id, city_id) VALUES (?, ?)');
  for (const cityId of cityIds) {
    insertCity.run(id, cityId);
  }
  const insertTag = db.prepare('INSERT OR IGNORE INTO activity_tags (activity_id, tag_id) VALUES (?, ?)');
  for (const tagId of tagIds) {
    insertTag.run(id, tagId);
  }
  return { id, name, notes, cityIds, tagIds };
}

export function updateActivity(id: number, name: string, notes: string, cityIds: number[], tagIds: number[]): Activity | null {
  const result = db.prepare('UPDATE activities SET name = ?, notes = ? WHERE id = ?').run(name, notes, id);
  if (result.changes === 0) return null;
  db.prepare('DELETE FROM activity_cities WHERE activity_id = ?').run(id);
  const insertCity = db.prepare('INSERT INTO activity_cities (activity_id, city_id) VALUES (?, ?)');
  for (const cityId of cityIds) {
    insertCity.run(id, cityId);
  }
  db.prepare('DELETE FROM activity_tags WHERE activity_id = ?').run(id);
  const insertTag = db.prepare('INSERT OR IGNORE INTO activity_tags (activity_id, tag_id) VALUES (?, ?)');
  for (const tagId of tagIds) {
    insertTag.run(id, tagId);
  }
  return { id, name, notes, cityIds, tagIds };
}

export function deleteActivity(id: number): boolean {
  const result = db.prepare('DELETE FROM activities WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getFoods(): Food[] {
  const rows = db.prepare('SELECT id, name, notes FROM foods ORDER BY name').all() as {
    id: number;
    name: string;
    notes: string;
  }[];
  return rows.map((r) => ({ ...r, cityIds: getCityIds('food_cities', 'food_id', r.id) }));
}

export function createFood(name: string, notes: string, cityIds: number[]): Food {
  const result = db.prepare('INSERT INTO foods (name, notes) VALUES (?, ?)').run(name, notes);
  const id = Number(result.lastInsertRowid);
  const insertCity = db.prepare('INSERT INTO food_cities (food_id, city_id) VALUES (?, ?)');
  for (const cityId of cityIds) {
    insertCity.run(id, cityId);
  }
  return { id, name, notes, cityIds };
}

export function updateFood(id: number, name: string, notes: string, cityIds: number[]): Food | null {
  const result = db.prepare('UPDATE foods SET name = ?, notes = ? WHERE id = ?').run(name, notes, id);
  if (result.changes === 0) return null;
  db.prepare('DELETE FROM food_cities WHERE food_id = ?').run(id);
  const insertCity = db.prepare('INSERT INTO food_cities (food_id, city_id) VALUES (?, ?)');
  for (const cityId of cityIds) {
    insertCity.run(id, cityId);
  }
  return { id, name, notes, cityIds };
}

export function deleteFood(id: number): boolean {
  const result = db.prepare('DELETE FROM foods WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getDayPlans(): DayPlan[] {
  const dates: string[] = [];
  for (let day = 7; day <= 23; day++) {
    dates.push(`2026-09-${String(day).padStart(2, '0')}`);
  }

  const getPlan = db.prepare(`
    SELECT dp.date, dp.city_id, c.name as city_name, c.color as city_color,
      dp.accommodation_name, dp.accommodation_details
    FROM day_plans dp
    LEFT JOIN cities c ON c.id = dp.city_id
    WHERE dp.date = ?
  `);

  const getItems = db.prepare(`
    SELECT di.id, di.date, di.item_type, di.item_id, di.sort_order,
      CASE
        WHEN di.item_type = 'activity' THEN a.name
        WHEN di.item_type = 'food' THEN f.name
      END as name
    FROM day_items di
    LEFT JOIN activities a ON di.item_type = 'activity' AND di.item_id = a.id
    LEFT JOIN foods f ON di.item_type = 'food' AND di.item_id = f.id
    WHERE di.date = ?
    ORDER BY di.sort_order, di.id
  `);

  return dates.map((date) => {
    const plan = getPlan.get(date) as {
      date: string;
      city_id: number | null;
      city_name: string | null;
      city_color: string | null;
      accommodation_name: string | null;
      accommodation_details: string | null;
    } | undefined;

    const items = getItems.all(date) as {
      id: number;
      date: string;
      item_type: 'activity' | 'food';
      item_id: number;
      sort_order: number;
      name: string;
    }[];

    return {
      date,
      cityId: plan?.city_id ?? null,
      cityName: plan?.city_name ?? null,
      cityColor: plan?.city_color ?? null,
      accommodationName: plan?.accommodation_name ?? '',
      accommodationDetails: plan?.accommodation_details ?? '',
      items: items.map((i) => ({
        id: i.id,
        date: i.date,
        itemType: i.item_type,
        itemId: i.item_id,
        sortOrder: i.sort_order,
        name: i.name,
      })),
    };
  });
}

export function updateDayCity(date: string, cityId: number | null): DayPlan | null {
  db.prepare(`
    INSERT INTO day_plans (date, city_id) VALUES (?, ?)
    ON CONFLICT(date) DO UPDATE SET city_id = excluded.city_id
  `).run(date, cityId);

  return getDayPlans().find((d) => d.date === date) ?? null;
}

export function updateDayAccommodation(
  date: string,
  accommodationName: string,
  accommodationDetails: string,
): DayPlan | null {
  db.prepare(`
    INSERT INTO day_plans (date, accommodation_name, accommodation_details)
    VALUES (?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      accommodation_name = excluded.accommodation_name,
      accommodation_details = excluded.accommodation_details
  `).run(date, accommodationName, accommodationDetails);

  return getDayPlans().find((d) => d.date === date) ?? null;
}

export function addDayItem(date: string, itemType: 'activity' | 'food', itemId: number): DayItem | null {
  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) as max_order FROM day_items WHERE date = ?')
    .get(date) as { max_order: number };

  try {
    const result = db
      .prepare('INSERT INTO day_items (date, item_type, item_id, sort_order) VALUES (?, ?, ?, ?)')
      .run(date, itemType, itemId, maxOrder.max_order + 1);

    const id = Number(result.lastInsertRowid);
    const name =
      itemType === 'activity'
        ? (db.prepare('SELECT name FROM activities WHERE id = ?').get(itemId) as { name: string } | undefined)?.name
        : (db.prepare('SELECT name FROM foods WHERE id = ?').get(itemId) as { name: string } | undefined)?.name;

    if (!name) return null;
    return { id, date, itemType, itemId, sortOrder: maxOrder.max_order + 1, name };
  } catch {
    return null;
  }
}

export function removeDayItem(id: number): boolean {
  const result = db.prepare('DELETE FROM day_items WHERE id = ?').run(id);
  return result.changes > 0;
}

export function reorderDayItems(date: string, itemIds: number[]): void {
  const update = db.prepare('UPDATE day_items SET sort_order = ? WHERE id = ? AND date = ?');
  const transaction = db.transaction(() => {
    itemIds.forEach((id, index) => update.run(index, id, date));
  });
  transaction();
}
