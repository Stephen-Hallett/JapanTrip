import { useState } from 'react';
import { pickRandomWord, type JpEntry } from '../data/japanese';

export function WordOfTheDay() {
  const [word, setWord] = useState<JpEntry>(pickRandomWord);

  const nextWord = () => {
    let next = pickRandomWord();
    while (next.text === word.text) next = pickRandomWord();
    setWord(next);
  };

  return (
    <aside className="word-of-day" aria-label="Travel phrase">
      <div className="word-of-day-header">
        <div className="word-of-day-label">
          <span className="word-of-day-jp-title">旅の言葉</span>
          <span className="word-of-day-en-title">Travel Phrase</span>
        </div>
        <button
          type="button"
          className="word-of-day-btn"
          onClick={nextWord}
          title="Next phrase"
          aria-label="Show next phrase"
        >
          ↻
        </button>
      </div>
      <div className="word-of-day-word">
        <span className="word-of-day-main">{word.text}</span>
        <span className="word-of-day-hira">{word.hiragana}</span>
      </div>
      <div className="word-of-day-meta">
        <span className="word-of-day-roma">{word.romaji}</span>
        {word.meaning && <span className="word-of-day-meaning">{word.meaning}</span>}
      </div>
    </aside>
  );
}
