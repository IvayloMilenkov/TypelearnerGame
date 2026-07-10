import { useState, useEffect, useRef, useCallback } from 'react';
import WordTarget from './WordTarget';
import PauseMenu from './PauseMenu';
import styles from '../styles/TimedGame.module.css';
import { normalWords, expertWords } from '../utils/wordLists.js';

function pickWord(mode, lastWord) {
  if (mode === 'easy') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let ch;
    do { ch = chars[Math.floor(Math.random() * chars.length)]; } while (ch === lastWord);
    return ch;
  }
  const list = mode === 'expert' ? expertWords : normalWords;
  let word;
  do { word = list[Math.floor(Math.random() * list.length)]; } while (word === lastWord);
  return word;
}

export default function TimedGame({ mode, duration = 30, onGameOver, onQuitToMenu }) {
  const DURATION = duration;
  const initialWord = pickWord(mode, null);

  const [text, setText] = useState(initialWord);
  const [typedCount, setTypedCount] = useState(0);
  const [wordKey, setWordKey] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [paused, setPaused] = useState(false);

  const textRef = useRef(initialWord);
  const typedCountRef = useRef(0);
  const scoreRef = useRef(0);
  const wordsRef = useRef(0);
  const gameOverFiredRef = useRef(false);
  const pausedRef = useRef(false);

  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { typedCountRef.current = typedCount; }, [typedCount]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { wordsRef.current = wordsCompleted; }, [wordsCompleted]);

  // Countdown — skips ticks while paused
  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fire game over when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && !gameOverFiredRef.current) {
      gameOverFiredRef.current = true;
      onGameOver({
        score: scoreRef.current,
        wordsCompleted: wordsRef.current,
      });
    }
  }, [timeLeft, onGameOver]);

  // Escape to pause/resume
  useEffect(() => {
    function onEsc(e) {
      if (e.key !== 'Escape') return;
      setPaused(p => {
        pausedRef.current = !p;
        return !p;
      });
    }
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  const advanceWord = useCallback(() => {
    const basePoints = mode === 'expert' ? 60 : mode === 'normal' ? 30 : 10;
    const newScore = scoreRef.current + basePoints;
    const newWords = wordsRef.current + 1;
    const next = pickWord(mode, textRef.current);

    setScore(newScore);
    setWordsCompleted(newWords);
    setText(next);
    setTypedCount(0);
    setWordKey(k => k + 1);
  }, [mode]);

  // Key handler
  useEffect(() => {
    function handleKey(e) {
      if (timeLeft === 0 || pausedRef.current) return;
      const key = e.key.toUpperCase();
      if (key.length !== 1 || key < 'A' || key > 'Z') return;

      const current = textRef.current;
      const count = typedCountRef.current;

      if (current[count] === key) {
        const newCount = count + 1;
        if (newCount >= current.length) {
          advanceWord();
        } else {
          setTypedCount(newCount);
        }
      } else {
        setShaking(true);
        setFlashing(true);
        setTimeout(() => setShaking(false), 230);
        setTimeout(() => setFlashing(false), 360);
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [timeLeft, advanceWord]);

  const isDanger = timeLeft <= 10;
  const progressPct = (timeLeft / DURATION) * 100;

  function handleResume() {
    pausedRef.current = false;
    setPaused(false);
  }

  return (
    <>
      {/* Pause overlay */}
      {paused && <PauseMenu onResume={handleResume} onQuit={onQuitToMenu} />}

      {/* Inline HUD */}
      <div className={styles.hud}>
        <div className={styles.hudSection}>
          <span className={styles.hudLabel}>Score</span>
          <span className={styles.hudValue}>{score.toLocaleString()}</span>
        </div>

        <div className={`${styles.hudSection} ${styles.center}`}>
          <span className={`${styles.timer} ${isDanger ? styles.timerDanger : ''}`}>
            {String(timeLeft).padStart(2, '0')}
          </span>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${isDanger ? styles.progressFillDanger : ''}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className={`${styles.hudSection} ${styles.right}`}>
          <span className={styles.hudLabel}>Words</span>
          <span className={styles.hudValue}>{wordsCompleted}</span>
        </div>
      </div>

      {/* Play area */}
      <div className={styles.arena}>
        <WordTarget
          key={wordKey}
          text={text}
          typedCount={typedCount}
          shaking={shaking}
          wordKey={wordKey}
        />
      </div>

      {flashing && <div className={styles.flashOverlay} />}
      <div className={styles.accentLine} />
    </>
  );
}
