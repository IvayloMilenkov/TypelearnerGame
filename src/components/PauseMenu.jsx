import styles from '../styles/PauseMenu.module.css';

export default function PauseMenu({ onResume, onQuit }) {
  return (
    <div className={styles.overlay}>
      <h2 className={styles.title}>PAUSED</h2>
      <div className={styles.buttons}>
        <button className={styles.resumeBtn} onClick={onResume}>
          RESUME
        </button>
        <button className={styles.quitBtn} onClick={onQuit}>
          QUIT TO MENU
        </button>
      </div>
      <p className={styles.hint}>Press ESC to resume</p>
    </div>
  );
}
