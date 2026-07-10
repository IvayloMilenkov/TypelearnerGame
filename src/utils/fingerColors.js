export const FINGER_COLORS = {
  // Pinkies — purple
  Q: '#cc44ff', A: '#cc44ff', Z: '#cc44ff',
  P: '#cc44ff',
  // Ring fingers — orange
  W: '#ff8800', S: '#ff8800', X: '#ff8800',
  O: '#ff8800', L: '#ff8800',
  // Middle fingers — blue
  E: '#00aaff', D: '#00aaff', C: '#00aaff',
  I: '#00aaff', K: '#00aaff',
  // Left index — green
  R: '#00ee88', F: '#00ee88', V: '#00ee88',
  T: '#00ee88', G: '#00ee88', B: '#00ee88',
  // Right index — yellow
  Y: '#ffee00', H: '#ffee00', N: '#ffee00',
  U: '#ffee00', J: '#ffee00', M: '#ffee00',
};

export function getCharColor(ch) {
  return FINGER_COLORS[ch.toUpperCase()] ?? '#ffffff';
}
