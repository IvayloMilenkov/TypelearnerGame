import { useState } from 'react';
import styles from '../styles/Menu.module.css';
import KeyboardGuide from './KeyboardGuide';

const FORMATS = [
  { id: 'endless', label: 'ENDLESS', hint: 'Letters fall. Press the key. Don\'t miss.' },
  { id: 'timed',   label: 'TIMED',   hint: 'One word. Type it. Race the clock.' },
];

const MODES = [
  { id: 'easy',   label: 'EASY',   desc: 'Single letters — learn the keyboard' },
  { id: 'normal', label: 'NORMAL', desc: '3–5 letter words — build your speed' },
  { id: 'expert', label: 'EXPERT', desc: '6–12 letter words — master typing' },
];

const DURATIONS = [30, 60, 90, 120];

export default function Menu({ onStart, highScore }) {
  const [format, setFormat] = useState('endless');
  const [mode, setMode] = useState('easy');
  const [duration, setDuration] = useState(30);
  const [showGuide, setShowGuide] = useState(false);

  const currentHint = FORMATS.find(f => f.id === format)?.hint ?? '';

  return (
    <>
      {showGuide && <KeyboardGuide onClose={() => setShowGuide(false)} />}

      <div className={styles.overlay}>
        <h1 className={styles.title}>KEYBOMB</h1>
        <p className={styles.subtitle}>Type fast. Destroy all.<span className={styles.caret}>_</span></p>

        {/* Format toggle */}
        <div className={styles.formatSelector}>
          {FORMATS.map(f => (
            <button
              key={f.id}
              className={`${styles.formatBtn} ${format === f.id ? styles.formatActive : ''}`}
              onClick={() => setFormat(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Duration picker — only shown for TIMED */}
        {format === 'timed' && (
          <div className={styles.durationSelector}>
            {DURATIONS.map(d => (
              <button
                key={d}
                className={`${styles.durationBtn} ${duration === d ? styles.durationActive : ''}`}
                onClick={() => setDuration(d)}
              >
                {d}s
              </button>
            ))}
          </div>
        )}

        {/* Difficulty cards */}
        <div className={styles.modeSelector}>
          {MODES.map(m => (
            <button
              key={m.id}
              className={`${styles.modeCard} ${mode === m.id ? styles.active : ''}`}
              onClick={() => setMode(m.id)}
            >
              <span className={styles.modeLabel}>{m.label}</span>
              <span className={styles.modeDesc}>{m.desc}</span>
            </button>
          ))}
        </div>

        {highScore > 0 && (
          <p className={styles.highScore}>Best: {highScore.toLocaleString()}</p>
        )}

        <button className={styles.startBtn} onClick={() => onStart(mode, format, duration)}>
          START GAME
        </button>

        <button className={styles.guideBtn} onClick={() => setShowGuide(true)}>
          FINGER GUIDE
        </button>

        <p className={styles.hint}>{currentHint}</p>
      </div>
    </>
  );
}
