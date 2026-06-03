import { useState } from 'react';
import styles from '../styles/Menu.module.css';

const MODES = [
  { id: 'easy',   label: 'EASY',   desc: 'Single letters — learn the keyboard' },
  { id: 'normal', label: 'NORMAL', desc: '3–5 letter words — build your speed' },
  { id: 'expert', label: 'EXPERT', desc: '6–12 letter words — master typing' },
];

export default function Menu({ onStart, highScore }) {
  const [mode, setMode] = useState('easy');

  return (
    <div className={styles.overlay}>
      <h1 className={styles.title}>KEYBOMB</h1>
      <p className={styles.subtitle}>Type fast. Destroy all.<span className={styles.caret}>_</span></p>

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

      <button className={styles.startBtn} onClick={() => onStart(mode)}>
        START GAME
      </button>

      <p className={styles.hint}>Letters fall. Press the key. Don't miss.</p>
    </div>
  );
}
