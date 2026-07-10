import { useEffect } from 'react';
import styles from '../styles/KeyboardGuide.module.css';
import { FINGER_COLORS } from '../utils/fingerColors';

const KEY_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

const LEGEND = [
  { color: '#cc44ff', label: 'Pinkies  (Q A Z · P)' },
  { color: '#ff8800', label: 'Ring  (W S X · O L)' },
  { color: '#00aaff', label: 'Middle  (E D C · I K)' },
  { color: '#00ee88', label: 'Left Index  (R F V T G B)' },
  { color: '#ffee00', label: 'Right Index  (Y H N U J M)' },
];

export default function KeyboardGuide({ onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <p className={styles.heading}>Finger Guide</p>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <div className={styles.keyboard}>
          {KEY_ROWS.map((row, ri) => (
            <div key={ri} className={styles.row}>
              {row.map(key => {
                const color = FINGER_COLORS[key] ?? '#ffffff';
                return (
                  <div
                    key={key}
                    className={styles.key}
                    style={{
                      color,
                      borderColor: `${color}66`,
                      background: `${color}18`,
                      textShadow: `0 0 8px ${color}`,
                    }}
                  >
                    {key}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className={styles.legend}>
          {LEGEND.map(({ color, label }) => (
            <div key={label} className={styles.legendItem}>
              <div className={styles.swatch} style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
              <span className={styles.legendLabel}>{label}</span>
            </div>
          ))}
        </div>

        <p className={styles.escHint}>press ESC or click outside to close</p>
      </div>
    </div>
  );
}
