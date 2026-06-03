import styles from '../styles/GameOver.module.css';

export default function GameOver({ stats, highScore, score, onRestart }) {
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div className={styles.overlay}>
      <h2 className={styles.title}>GAME OVER</h2>

      {isNewRecord && <p className={styles.newRecord}>New Record!</p>}

      <div className={styles.stats}>
        {stats.map(({ label, value }) => (
          <div key={label} className={styles.stat}>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
          </div>
        ))}
      </div>

      <button className={styles.btn} onClick={onRestart}>
        PLAY AGAIN
      </button>
    </div>
  );
}
