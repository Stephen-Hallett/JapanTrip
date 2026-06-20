import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { JpEntry } from '../data/japanese';

interface Props {
  entry: JpEntry;
  className?: string;
}

export function JpText({ entry, className = '' }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const show = () => {
    if (!spanRef.current) return;
    const r = spanRef.current.getBoundingClientRect();
    const below = r.top < 100;
    setPos({ x: r.left + r.width / 2, y: below ? r.bottom + 8 : r.top - 8, below });
  };

  const hide = () => setPos(null);

  return (
    <>
      <span
        ref={spanRef}
        className={`jp-text ${className}`}
        tabIndex={0}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {entry.text}
      </span>
      {pos &&
        createPortal(
          <div
            className={`jp-tooltip-portal ${pos.below ? 'jp-tt-below' : 'jp-tt-above'}`}
            style={{
              position: 'fixed',
              left: pos.x,
              top: pos.y,
              transform: pos.below ? 'translateX(-50%)' : 'translateX(-50%) translateY(-100%)',
            }}
            role="tooltip"
          >
            <span className="jp-tooltip-line jp-tooltip-hira">{entry.hiragana}</span>
            <span className="jp-tooltip-line jp-tooltip-roma">{entry.romaji}</span>
            {entry.meaning && (
              <span className="jp-tooltip-line jp-tooltip-mean">{entry.meaning}</span>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
