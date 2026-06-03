import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '../styles/FallingLetter.module.css';

function getFontSize(len) {
  if (len <= 1) return '2.4rem';
  if (len <= 4) return '2.0rem';
  if (len <= 6) return '1.7rem';
  return '1.45rem';
}

export default function FallingLetter({ letter, onMiss, onDestroyDone, paused }) {
  const { id, text, typedCount, x, fallDurationSec, color, destroyed } = letter;
  const letterRef = useRef(null);
  const [explodeRect, setExplodeRect] = useState(null);

  useEffect(() => {
    if (!destroyed) return;
    if (letterRef.current) {
      const rect = letterRef.current.getBoundingClientRect();
      setExplodeRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }
    const timer = setTimeout(() => onDestroyDone(id), 400);
    return () => clearTimeout(timer);
  }, [destroyed, id, onDestroyDone]);

  function handleAnimationEnd() {
    if (!destroyed) onMiss(id);
  }

  const glow = color;
  const textShadow = `0 0 8px ${glow}, 0 0 20px ${glow}, 0 0 40px ${glow}`;

  return (
    <>
      <div
        ref={letterRef}
        className={styles.letter}
        style={{
          left: `${x}%`,
          color: glow,
          textShadow,
          fontSize: getFontSize(text.length),
          animationDuration: `${fallDurationSec}s`,
          animationPlayState: paused ? 'paused' : 'running',
          opacity: explodeRect ? 0 : undefined,
        }}
        onAnimationEnd={handleAnimationEnd}
      >
        {text.length === 1 ? text : text.split('').map((ch, i) => (
          <span
            key={i}
            className={
              i < typedCount ? styles.typed :
              i === typedCount ? styles.active :
              styles.upcoming
            }
          >{ch}</span>
        ))}
      </div>

      {explodeRect && createPortal(
        <div
          className={styles.explosion}
          style={{
            top: explodeRect.top,
            left: explodeRect.left,
            width: explodeRect.width,
            height: explodeRect.height,
            color: glow,
            textShadow,
            fontSize: getFontSize(text.length),
          }}
        >
          {text}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <span
              key={i}
              className={styles.shard}
              style={{ background: glow, boxShadow: `0 0 6px ${glow}` }}
            />
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
