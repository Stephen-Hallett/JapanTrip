import { useDraggable } from '@dnd-kit/core';
import type { DayItem, DragItem } from '../types';

interface Props {
  item: DayItem;
  onRemove: () => void;
}

export function DayItemChip({ item, onRemove }: Props) {
  const dragData: DragItem = {
    type: item.itemType,
    id: item.itemId,
    name: item.name,
    source: 'day',
    dayItemId: item.id,
    date: item.date,
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `day-item-${item.id}`,
    data: dragData,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.5 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`day-chip ${item.itemType} ${isDragging ? 'dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <span>{item.itemType === 'activity' ? '⛩' : '🍜'}</span>
      <span className="day-chip-name">{item.name}</span>
      <button
        type="button"
        className="day-chip-remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        ×
      </button>
    </div>
  );
}
