import { useRef, useEffect } from 'react';
import styles from '../styles/HUD.module.css';

const LEVEL_NAMES = ['Beginner', 'Intermediate', 'Expert'];

export default function HUD({ score, lives, combo, level }) {
  const comboRef = useRef(null);
  const prevCombo = useRef(combo);

  useEffect(() => {
    if (combo > prevCombo.current && combo > 1 && comboRef.current) {
      comboRef.current.classList.remove(styles.comboPulse);
      void comboRef.current.offsetWidth; // reflow to restart animation
      comboRef.current.classList.add(styles.comboPulse);
    }
    prevCombo.current = combo;
  }, [combo]);

  const hearts = Array.from({ length: 3 }, (_, i) => i < lives ? '♥' : '♡').join(' ');

  return (
    <>
      <div className={styles.hud}>
        <div className={styles.section}>
          <span className={styles.label}>Score</span>
          <span className={styles.value}>{score.toLocaleString()}</span>
        </div>

        <div className={`${styles.section} ${styles.center}`}>
          <span className={styles.label}>Lives</span>
          <span className={styles.lives}>{hearts}</span>
          <span className={styles.levelBadge}>{LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)]}</span>
        </div>

        <div className={`${styles.section} ${styles.right}`}>
          <span className={styles.label}>Combo</span>
          <span
            ref={comboRef}
            className={`${styles.value} ${styles.combo}`}
            onAnimationEnd={() => comboRef.current?.classList.remove(styles.comboPulse)}
          >
            {combo > 1 ? `x${combo}` : '—'}
          </span>
        </div>
      </div>

      {/* Danger line at bottom */}
      <div className={styles.dangerBar} />
    </>
  );
}
