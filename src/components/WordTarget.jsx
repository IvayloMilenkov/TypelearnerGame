import styles from '../styles/WordTarget.module.css';
import { getCharColor } from '../utils/fingerColors';

export default function WordTarget({ text, typedCount, shaking, wordKey }) {
  const progress = text.length > 0 ? typedCount / text.length : 0;
  const opacity = 0.25 + progress * 0.75;

  const fontSize = text.length <= 1
    ? '5rem'
    : text.length <= 5
      ? 'clamp(3rem, 6vw, 4.5rem)'
      : 'clamp(2rem, 4vw, 3.2rem)';

  return (
    <div
      key={wordKey}
      className={`${styles.container} ${shaking ? styles.shaking : ''}`}
      style={{ opacity, fontSize }}
    >
      {text.split('').map((ch, i) => {
        const color = getCharColor(ch);
        return (
          <span
            key={i}
            className={
              i < typedCount ? styles.typed :
              i === typedCount ? styles.active :
              styles.upcoming
            }
            style={{ color, textShadow: `0 0 8px ${color}99` }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}
