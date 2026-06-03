import { useState, useCallback } from 'react';
import Menu from './components/Menu';
import Game from './components/Game';
import GameOver from './components/GameOver';
import './styles/global.css';

function hsKey(mode) {
  return `keybomb_hs_${mode}`;
}

function getHighScore(mode) {
  return parseInt(localStorage.getItem(hsKey(mode)) || '0', 10);
}

function saveHighScore(mode, score) {
  if (score > getHighScore(mode)) localStorage.setItem(hsKey(mode), String(score));
}

export default function App() {
  const [phase, setPhase] = useState('menu');
  const [mode, setMode] = useState('easy');
  const [gameResult, setGameResult] = useState(null);
  const [highScore, setHighScore] = useState(() => getHighScore('easy'));

  const handleStart = useCallback((selectedMode) => {
    setMode(selectedMode);
    setHighScore(getHighScore(selectedMode));
    setPhase('playing');
  }, []);

  const handleGameOver = useCallback((result) => {
    saveHighScore(mode, result.score);
    setHighScore(getHighScore(mode));
    setGameResult(result);
    setPhase('gameover');
  }, [mode]);

  const handleRestart = useCallback(() => {
    setGameResult(null);
    setPhase('playing');
  }, []);

  const handleQuitToMenu = useCallback(() => {
    setGameResult(null);
    setPhase('menu');
  }, []);

  return (
    <>
      {phase === 'menu' && (
        <Menu onStart={handleStart} highScore={highScore} />
      )}

      {phase === 'playing' && (
        <Game
          key={`${mode}-${Date.now()}`}
          mode={mode}
          onGameOver={handleGameOver}
          onQuitToMenu={handleQuitToMenu}
        />
      )}

      {phase === 'gameover' && gameResult && (
        <GameOver
          score={gameResult.score}
          maxCombo={gameResult.maxCombo}
          destroyed={gameResult.destroyed}
          highScore={highScore}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
