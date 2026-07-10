import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '../styles/FallingLetter.module.css';
import { getCharColor } from '../utils/fingerColors';

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

  // Fall-speed color used only for the explosion flash
  const explodeColor = color;
  const explodeGlow = `0 0 8px ${explodeColor}, 0 0 20px ${explodeColor}, 0 0 40px ${explodeColor}`;

  return (
    <>
      <div
        ref={letterRef}
        className={styles.letter}
        style={{
          left: `${x}%`,
          fontSize: getFontSize(text.length),
          animationDuration: `${fallDurationSec}s`,
          animationPlayState: paused ? 'paused' : 'running',
          opacity: explodeRect ? 0 : undefined,
        }}
        onAnimationEnd={handleAnimationEnd}
      >
        {text.split('').map((ch, i) => {
          const charColor = getCharColor(ch);
          return (
            <span
              key={i}
              className={
                text.length === 1 ? undefined :
                i < typedCount ? styles.typed :
                i === typedCount ? styles.active :
                styles.upcoming
              }
              style={{ color: charColor, textShadow: `0 0 8px ${charColor}99, 0 0 20px ${charColor}55` }}
            >{ch}</span>
          );
        })}
      </div>

      {explodeRect && createPortal(
        <div
          className={styles.explosion}
          style={{
            top: explodeRect.top,
            left: explodeRect.left,
            width: explodeRect.width,
            height: explodeRect.height,
            color: explodeColor,
            textShadow: explodeGlow,
            fontSize: getFontSize(text.length),
          }}
        >
          {text}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <span
              key={i}
              className={styles.shard}
              style={{ background: explodeColor, boxShadow: `0 0 6px ${explodeColor}` }}
            />
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
