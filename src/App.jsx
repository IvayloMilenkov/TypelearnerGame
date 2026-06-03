import { useState, useCallback } from 'react';
import Menu from './components/Menu';
import Game from './components/Game';
import TimedGame from './components/TimedGame';
import GameOver from './components/GameOver';
import './styles/global.css';

function hsKey(format, mode) {
  return `keybomb_hs_${format}_${mode}`;
}

function getHighScore(format, mode) {
  return parseInt(localStorage.getItem(hsKey(format, mode)) || '0', 10);
}

function saveHighScore(format, mode, score) {
  if (score > getHighScore(format, mode)) {
    localStorage.setItem(hsKey(format, mode), String(score));
  }
}

function buildStats(format, result) {
  if (format === 'timed') {
    return [
      { label: 'Score',  value: result.score },
      { label: 'Words',  value: result.wordsCompleted },
      { label: 'WPM',    value: result.wordsCompleted }, // 60s run → words = WPM
    ];
  }
  return [
    { label: 'Score',      value: result.score },
    { label: 'Best Combo', value: `x${result.maxCombo}` },
    { label: 'Destroyed',  value: result.destroyed },
  ];
}

export default function App() {
  const [phase, setPhase] = useState('menu');
  const [mode, setMode] = useState('easy');
  const [format, setFormat] = useState('endless');
  const [gameResult, setGameResult] = useState(null);
  const [highScore, setHighScore] = useState(() => getHighScore('endless', 'easy'));

  const handleStart = useCallback((selectedMode, selectedFormat) => {
    setMode(selectedMode);
    setFormat(selectedFormat);
    setHighScore(getHighScore(selectedFormat, selectedMode));
    setPhase('playing');
  }, []);

  const handleGameOver = useCallback((result) => {
    saveHighScore(format, mode, result.score);
    setHighScore(getHighScore(format, mode));
    setGameResult(result);
    setPhase('gameover');
  }, [format, mode]);

  const handleRestart = useCallback(() => {
    setGameResult(null);
    setPhase('playing');
  }, []);

  const handleQuitToMenu = useCallback(() => {
    setGameResult(null);
    setPhase('menu');
  }, []);

  const gameKey = `${format}-${mode}-${Date.now()}`;

  return (
    <>
      {phase === 'menu' && (
        <Menu onStart={handleStart} highScore={highScore} />
      )}

      {phase === 'playing' && format === 'endless' && (
        <Game
          key={gameKey}
          mode={mode}
          onGameOver={handleGameOver}
          onQuitToMenu={handleQuitToMenu}
        />
      )}

      {phase === 'playing' && format === 'timed' && (
        <TimedGame
          key={gameKey}
          mode={mode}
          onGameOver={handleGameOver}
          onQuitToMenu={handleQuitToMenu}
        />
      )}

      {phase === 'gameover' && gameResult && (
        <GameOver
          score={gameResult.score}
          stats={buildStats(format, gameResult)}
          highScore={highScore}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
