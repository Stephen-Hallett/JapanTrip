import { useDraggable } from '@dnd-kit/core';
import type { DragItem, Tag } from '../types';

interface Props {
  type: 'activity' | 'food';
  id: number;
  name: string;
  subtitle?: string;
  notes?: string;
  cityColor?: string;
  tags?: Tag[];
  onDelete: () => void;
}

export function DraggablePoolItem({ type, id, name, subtitle, notes, cityColor, tags, onDelete }: Props) {
  const dragData: DragItem = { type, id, name, source: 'pool' };
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pool-${type}-${id}`,
    data: dragData,
  });

  const fallbackColor = type === 'activity' ? 'var(--accent)' : 'var(--gold)';

  const style = {
    ...(transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : {}),
    opacity: isDragging ? 0.4 : 1,
    borderLeftColor: cityColor ?? fallbackColor,
  };

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
        {tags && tags.length > 0 && (
          <div className="pool-item-tags">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="pool-tag-chip"
                style={{ background: tag.color + '22', borderColor: tag.color, color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
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
