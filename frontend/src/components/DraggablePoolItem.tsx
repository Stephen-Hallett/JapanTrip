import { useDraggable } from '@dnd-kit/core';
import type { DragItem } from '../types';

interface Props {
  type: 'activity' | 'food';
  id: number;
  name: string;
  subtitle?: string;
  notes?: string;
  onDelete: () => void;
}

export function DraggablePoolItem({ type, id, name, subtitle, notes, onDelete }: Props) {
  const dragData: DragItem = { type, id, name, source: 'pool' };
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pool-${type}-${id}`,
    data: dragData,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.5 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pool-item ${type} ${isDragging ? 'dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <span className="pool-item-icon">{type === 'activity' ? '⛩' : '🍜'}</span>
      <div className="pool-item-body">
        <strong>{name}</strong>
        {subtitle && <span className="pool-item-sub">{subtitle}</span>}
        {notes && <span className="pool-item-notes">{notes}</span>}
      </div>
      <button
        type="button"
        className="btn btn-sm btn-ghost pool-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        ×
      </button>
    </div>
  );
}
