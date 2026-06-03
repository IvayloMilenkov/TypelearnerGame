import styles from '../styles/WordTarget.module.css';

export default function WordTarget({ text, typedCount, shaking, wordKey, color }) {
  // Progressive opacity: dim on spawn, brightens as you type
  const progress = text.length > 0 ? typedCount / text.length : 0;
  const opacity = 0.25 + progress * 0.75;

  const glow = color || '#00f5ff';
  const textShadow = `0 0 8px ${glow}, 0 0 24px ${glow}66`;
  const fontSize = text.length <= 1 ? '5rem' : text.length <= 5 ? 'clamp(3rem, 6vw, 4.5rem)' : 'clamp(2rem, 4vw, 3.2rem)';

  return (
    <div
      key={wordKey}
      className={`${styles.container} ${shaking ? styles.shaking : ''}`}
      style={{ opacity, color: glow, textShadow, fontSize }}
    >
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className={
            i < typedCount ? styles.typed :
            i === typedCount ? styles.active :
            styles.upcoming
          }
        >
          {ch}
        </span>
      ))}
    </div>
  );
}
