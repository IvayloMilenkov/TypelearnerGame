import { useState, useCallback, useRef, useEffect } from 'react';
import FallingLetter from './FallingLetter';
import HUD from './HUD';
import PauseMenu from './PauseMenu';
import styles from '../styles/Game.module.css';
import { getDifficulty, getLetterColor } from '../utils/difficulty';
import { useKeyPress } from '../hooks/useKeyPress';

let idCounter = 0;

export default function Game({ onGameOver, onQuitToMenu, mode }) {
  const [letters, setLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [destroyed, setDestroyed] = useState(0);
  const [level, setLevel] = useState(0);
  const [paused, setPaused] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [levelBanner, setLevelBanner] = useState(null);

  const livesRef = useRef(lives);
  const scoreRef = useRef(score);
  const comboRef = useRef(combo);
  const maxComboRef = useRef(maxCombo);
  const destroyedRef = useRef(destroyed);
  const lettersRef = useRef(letters);
  const levelRef = useRef(level);
  const startTimeRef = useRef(Date.now());
  const lastSpawnRef = useRef(Date.now());
  const rafRef = useRef(null);
  const gameActiveRef = useRef(true);
  const pausedRef = useRef(false);
  const pauseStartRef = useRef(null);
  const totalPausedMsRef = useRef(0);
  const usedXPositions = useRef([]);

  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { maxComboRef.current = maxCombo; }, [maxCombo]);
  useEffect(() => { destroyedRef.current = destroyed; }, [destroyed]);
  useEffect(() => { lettersRef.current = letters; }, [letters]);
  useEffect(() => { levelRef.current = level; }, [level]);

  function randomX(existingXs, minGap = 8, maxX = 88) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const x = 5 + Math.random() * (maxX - 5);
      const tooClose = existingXs.some(ex => Math.abs(ex - x) < minGap);
      if (!tooClose) return x;
    }
    return 5 + Math.random() * (maxX - 5);
  }

  function spawnLetter(difficulty) {
    const isWordMode = !!difficulty.wordList;
    const text = isWordMode
      ? difficulty.wordList[Math.floor(Math.random() * difficulty.wordList.length)]
      : difficulty.activeChars[Math.floor(Math.random() * difficulty.activeChars.length)];

    // Words need more horizontal clearance
    const minGap = isWordMode ? 22 : 8;
    const maxX = isWordMode ? 62 : 88;
    const x = randomX(usedXPositions.current, minGap, maxX);
    usedXPositions.current = [...usedXPositions.current.slice(-5), x];

    const color = getLetterColor(difficulty.fallDurationSec);
    setLetters(prev => [
      ...prev,
      { id: ++idCounter, text, typedCount: 0, x, fallDurationSec: difficulty.fallDurationSec, color, destroyed: false },
    ]);
  }

  // Game loop — RAF keeps running during pause but skips logic
  useEffect(() => {
    function tick() {
      if (!gameActiveRef.current) return;

      if (!pausedRef.current) {
        const elapsed = (Date.now() - startTimeRef.current - totalPausedMsRef.current) / 1000;
        const difficulty = getDifficulty(elapsed, mode);

        if (difficulty.level !== levelRef.current) {
          setLevel(difficulty.level);
          setLevelBanner(`Level ${difficulty.level + 1}`);
          setTimeout(() => setLevelBanner(null), 1600);
        }

        const now = Date.now();
        if (now - lastSpawnRef.current >= difficulty.spawnIntervalMs) {
          lastSpawnRef.current = now;
          spawnLetter(difficulty);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    gameActiveRef.current = true;
    pausedRef.current = false;
    totalPausedMsRef.current = 0;
    startTimeRef.current = Date.now();
    lastSpawnRef.current = Date.now();

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      gameActiveRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape key → toggle pause
  useEffect(() => {
    function handleEscape(e) {
      if (e.key !== 'Escape' || !gameActiveRef.current) return;
      if (!pausedRef.current) {
        pausedRef.current = true;
        pauseStartRef.current = Date.now();
        setPaused(true);
      } else {
        totalPausedMsRef.current += Date.now() - pauseStartRef.current;
        pausedRef.current = false;
        lastSpawnRef.current = Date.now(); // reset spawn timer so nothing bursts right after unpause
        setPaused(false);
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleResume = useCallback(() => {
    totalPausedMsRef.current += Date.now() - pauseStartRef.current;
    pausedRef.current = false;
    lastSpawnRef.current = Date.now();
    setPaused(false);
  }, []);

  const handleQuit = useCallback(() => {
    gameActiveRef.current = false;
    cancelAnimationFrame(rafRef.current);
    onQuitToMenu();
  }, [onQuitToMenu]);

  const handleMiss = useCallback((id) => {
    setLetters(prev => prev.filter(l => l.id !== id));
    const newLives = livesRef.current - 1;
    setLives(newLives);
    setCombo(0);
    setShaking(true);
    setFlashing(true);
    setTimeout(() => setShaking(false), 260);
    setTimeout(() => setFlashing(false), 410);

    if (newLives <= 0) {
      gameActiveRef.current = false;
      cancelAnimationFrame(rafRef.current);
      setTimeout(() => {
        onGameOver({
          score: scoreRef.current,
          maxCombo: maxComboRef.current,
          destroyed: destroyedRef.current,
        });
      }, 300);
    }
  }, [onGameOver]);

  const handleDestroyDone = useCallback((id) => {
    setLetters(prev => prev.filter(l => l.id !== id));
  }, []);

  const handleKey = useCallback((key) => {
    const current = lettersRef.current;

    // Find candidates: letters/words whose next expected char matches key
    const candidates = current.filter(
      l => !l.destroyed && l.typedCount < l.text.length && l.text[l.typedCount] === key
    );

    if (candidates.length === 0) {
      // Wrong key — only penalise combo in easy mode
      if (mode === 'easy') setCombo(0);
      return;
    }

    // Prefer the candidate with most progress (highest typedCount)
    const target = candidates.reduce((best, l) => l.typedCount > best.typedCount ? l : best, candidates[0]);
    const newCount = target.typedCount + 1;
    const isComplete = newCount >= target.text.length;

    setLetters(prev => prev.map(l =>
      l.id === target.id ? { ...l, typedCount: newCount, destroyed: isComplete } : l
    ));

    if (isComplete) {
      const newCombo = comboRef.current + 1;
      const basePoints = mode === 'expert' ? 60 : mode === 'normal' ? 30 : 10;
      const multiplier = newCombo >= 3 ? Math.floor(newCombo / 3) + 1 : 1;
      setCombo(newCombo);
      setScore(prev => prev + basePoints * multiplier);
      setDestroyed(prev => prev + 1);
      if (newCombo > maxComboRef.current) setMaxCombo(newCombo);
    }
  }, [mode]);

  useKeyPress(handleKey, !paused);

  return (
    <>
      <HUD score={score} lives={lives} combo={combo} level={level} />

      <div className={`${styles.arena} ${shaking ? styles.shake : ''}`}>
        {letters.map(letter => (
          <FallingLetter
            key={letter.id}
            letter={letter}
            onMiss={handleMiss}
            onDestroyDone={handleDestroyDone}
            paused={paused}
          />
        ))}
      </div>

      {flashing && <div className={styles.flashOverlay} />}
      {levelBanner && <div className={styles.levelBanner}>{levelBanner}</div>}
      {paused && <PauseMenu onResume={handleResume} onQuit={handleQuit} />}
    </>
  );
}
