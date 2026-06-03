import styles from '../styles/GameOver.module.css';

export default function GameOver({ score, maxCombo, destroyed, highScore, onRestart }) {
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div className={styles.overlay}>
      <h2 className={styles.title}>GAME OVER</h2>

      {isNewRecord && <p className={styles.newRecord}>New Record!</p>}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Score</span>
          <span className={styles.statValue}>{score.toLocaleString()}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Best Combo</span>
          <span className={styles.statValue}>x{maxCombo}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Destroyed</span>
          <span className={styles.statValue}>{destroyed}</span>
        </div>
      </div>

      <button className={styles.btn} onClick={onRestart}>
        PLAY AGAIN
      </button>
    </div>
  );
}
