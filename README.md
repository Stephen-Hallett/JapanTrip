# Japan Trip Planner

A React + TypeScript trip planner for your Japan holiday (7–23 September 2026).

## Features

- **Cities** — Add cities with custom colours; days on the calendar are tinted by assigned city
- **Activities** — Track things to do, tagged with one or more cities
- **Food** — Track restaurants and dishes to try, tagged by city
- **Trip calendar** — Three-week view (7–23 Sep), drag activities and food onto days
- **Flight info** — Arrive NRT 17:40 on the 7th, depart KIX 21:25 on the 23rd

## Local development

```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

Frontend runs at http://localhost:5173 (proxies API to port 3001).

## Docker (production)

```bash
cp .env.example .env
docker compose up -d --build
```

App available at http://localhost:8080 (or whatever `APP_PORT` you set).

SQLite database is persisted in `./data/` via a volume mount.

## Stack

- React 19 + TypeScript + Vite
- Express + better-sqlite3
- @dnd-kit for drag and drop
- Single Docker container (API serves the built frontend)
