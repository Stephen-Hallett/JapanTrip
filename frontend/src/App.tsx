import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { api } from "./api";
import { ActivityPanel } from "./components/ActivityPanel";
import { CityManager } from "./components/CityManager";
import { FoodPanel } from "./components/FoodPanel";
import { JpText } from "./components/JpText";
import { TripCalendar } from "./components/TripCalendar";
import { WordOfTheDay } from "./components/WordOfTheDay";
import { JP_LABELS } from "./data/japanese";
import { usePlannerData } from "./hooks/usePlannerData";
import type { DragItem } from "./types";
import "./App.css";

function App() {
  const { cities, tags, activities, foods, days, loading, error, refresh } =
    usePlannerData();
  const [activeDrag, setActiveDrag] = useState<DragItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDrag(event.active.data.current as DragItem);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const dragItem = active.data.current as DragItem;
    const overId = String(over.id);

    if (overId.startsWith("day-")) {
      const targetDate = overId.replace("day-", "");

      if (dragItem.source === "pool") {
        await api.addDayItem(targetDate, dragItem.type, dragItem.id);
        refresh();
      } else if (
        dragItem.source === "day" &&
        dragItem.date &&
        dragItem.date !== targetDate
      ) {
        if (dragItem.dayItemId) {
          await api.removeDayItem(dragItem.dayItemId);
        }
        await api.addDayItem(targetDate, dragItem.type, dragItem.id);
        refresh();
      }
    }
  };

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <span className="loading-kanji">
            <JpText entry={JP_LABELS.japan} />
          </span>
          <p>Loading your trip planner…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app error-screen">
        <h1>Could not connect</h1>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={refresh}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app">
        <header className="site-header">
          <div className="header-pattern" aria-hidden />
          <div className="header-content">
            <div className="header-main">
              <h1>
                <span className="header-kanji">
                  <JpText entry={JP_LABELS.japan} />
                </span>
                Japan Trip Planner
              </h1>
              <p className="header-dates">
                7 – 23 September 2026 · Tokyo → Osaka
              </p>
            </div>
            <WordOfTheDay />
          </div>
        </header>

        <main className="layout">
          <aside className="sidebar">
            <ActivityPanel
              activities={activities}
              cities={cities}
              tags={tags}
              onUpdate={refresh}
            />
            <FoodPanel foods={foods} cities={cities} onUpdate={refresh} />
            <CityManager cities={cities} onUpdate={refresh} />
          </aside>

          <div className="main-content">
            <TripCalendar days={days} cities={cities} onUpdate={refresh} />
          </div>
        </main>
      </div>

      <DragOverlay>
        {activeDrag ? (
          <div className={`drag-overlay-item ${activeDrag.type}`}>
            <span>{activeDrag.type === "activity" ? "⛩" : "🍜"}</span>
            {activeDrag.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
