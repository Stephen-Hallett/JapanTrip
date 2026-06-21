import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDb,
  getCities, createCity, updateCity, deleteCity,
  getTags, createTag, updateTag, deleteTag,
  getActivities, createActivity, updateActivity, deleteActivity,
  getFoods, createFood, updateFood, deleteFood,
  getDayPlans, updateDayCity, updateDayAccommodation,
  addDayItem, removeDayItem, reorderDayItems,
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;

initDb();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/cities', (_req, res) => {
  res.json(getCities());
});

app.post('/api/cities', (req, res) => {
  const { name, color } = req.body;
  if (!name?.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  try {
    res.status(201).json(createCity(name.trim(), color || '#c41e3a'));
  } catch {
    res.status(409).json({ error: 'City already exists' });
  }
});

app.put('/api/cities/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, color } = req.body;
  const city = updateCity(id, name?.trim(), color);
  if (!city) {
    res.status(404).json({ error: 'City not found' });
    return;
  }
  res.json(city);
});

app.delete('/api/cities/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!deleteCity(id)) {
    res.status(404).json({ error: 'City not found' });
    return;
  }
  res.status(204).send();
});

app.get('/api/tags', (_req, res) => {
  res.json(getTags());
});

app.post('/api/tags', (req, res) => {
  const { name, color } = req.body;
  if (!name?.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  try {
    res.status(201).json(createTag(name.trim(), color || '#c41e3a'));
  } catch {
    res.status(409).json({ error: 'Tag already exists' });
  }
});

app.put('/api/tags/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, color } = req.body;
  const tag = updateTag(id, name?.trim(), color);
  if (!tag) {
    res.status(404).json({ error: 'Tag not found' });
    return;
  }
  res.json(tag);
});

app.delete('/api/tags/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!deleteTag(id)) {
    res.status(404).json({ error: 'Tag not found' });
    return;
  }
  res.status(204).send();
});

app.get('/api/activities', (_req, res) => {
  res.json(getActivities());
});

app.post('/api/activities', (req, res) => {
  const { name, notes, cityIds, tagIds } = req.body;
  if (!name?.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  res.status(201).json(createActivity(name.trim(), notes || '', cityIds || [], tagIds || []));
});

app.put('/api/activities/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, notes, cityIds, tagIds } = req.body;
  const activity = updateActivity(id, name?.trim(), notes || '', cityIds || [], tagIds || []);
  if (!activity) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }
  res.json(activity);
});

app.delete('/api/activities/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!deleteActivity(id)) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }
  res.status(204).send();
});

app.get('/api/foods', (_req, res) => {
  res.json(getFoods());
});

app.post('/api/foods', (req, res) => {
  const { name, notes, cityIds } = req.body;
  if (!name?.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  res.status(201).json(createFood(name.trim(), notes || '', cityIds || []));
});

app.put('/api/foods/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, notes, cityIds } = req.body;
  const food = updateFood(id, name?.trim(), notes || '', cityIds || []);
  if (!food) {
    res.status(404).json({ error: 'Food not found' });
    return;
  }
  res.json(food);
});

app.delete('/api/foods/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!deleteFood(id)) {
    res.status(404).json({ error: 'Food not found' });
    return;
  }
  res.status(204).send();
});

app.get('/api/days', (_req, res) => {
  res.json(getDayPlans());
});

app.put('/api/days/:date/city', (req, res) => {
  const date = req.params.date;
  const { cityId } = req.body;
  const plan = updateDayCity(date, cityId ?? null);
  if (!plan) {
    res.status(404).json({ error: 'Day not found' });
    return;
  }
  res.json(plan);
});

app.put('/api/days/:date/accommodation', (req, res) => {
  const date = req.params.date;
  const { accommodationName, accommodationDetails } = req.body;
  const plan = updateDayAccommodation(
    date,
    accommodationName ?? '',
    accommodationDetails ?? '',
  );
  if (!plan) {
    res.status(404).json({ error: 'Day not found' });
    return;
  }
  res.json(plan);
});

app.post('/api/days/:date/items', (req, res) => {
  const date = req.params.date;
  const { itemType, itemId } = req.body;
  if (!itemType || !itemId) {
    res.status(400).json({ error: 'itemType and itemId are required' });
    return;
  }
  const item = addDayItem(date, itemType, Number(itemId));
  if (!item) {
    res.status(409).json({ error: 'Item already on this day or not found' });
    return;
  }
  res.status(201).json(item);
});

app.delete('/api/day-items/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!removeDayItem(id)) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  res.status(204).send();
});

app.put('/api/days/:date/reorder', (req, res) => {
  const date = req.params.date;
  const { itemIds } = req.body;
  if (!Array.isArray(itemIds)) {
    res.status(400).json({ error: 'itemIds must be an array' });
    return;
  }
  reorderDayItems(date, itemIds);
  res.json(getDayPlans().find((d) => d.date === date));
});

const staticPath = path.join(__dirname, '..', 'public');
app.use(express.static(staticPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Not found' });
  });
});

app.listen(PORT, () => {
  console.log(`Japan Planner API running on port ${PORT}`);
});
