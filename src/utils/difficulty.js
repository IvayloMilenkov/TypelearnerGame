import { normalWords, expertWords } from './wordLists.js';

const charSets = [
  'ASDFJKL',
  'ASDFJKLGHEIORU',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
];

export function getDifficulty(elapsedSeconds, mode = 'easy') {
  const level = Math.min(Math.floor(elapsedSeconds / 30), 2);

  if (mode === 'normal') {
    return {
      level,
      spawnIntervalMs: Math.max(1000, 2200 - level * 400),
      fallDurationSec: Math.max(3.5, 7 - level * 1.2),
      wordList: normalWords,
      activeChars: null,
    };
  }

  if (mode === 'expert') {
    return {
      level,
      spawnIntervalMs: Math.max(1500, 3000 - level * 500),
      fallDurationSec: Math.max(5.0, 10 - level * 1.5),
      wordList: expertWords,
      activeChars: null,
    };
  }

  // easy (default)
  return {
    level,
    spawnIntervalMs: Math.max(400, 1400 - level * 200),
    fallDurationSec: Math.max(1.8, 5 - level * 0.5),
    wordList: null,
    activeChars: charSets[level],
  };
}

export function getLetterColor(fallDurationSec) {
  if (fallDurationSec < 2.5) return '#ff00ff';
  if (fallDurationSec < 4.0) return '#ffff00';
  return '#00f5ff';
}
