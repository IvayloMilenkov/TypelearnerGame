import { useEffect } from 'react';

export function useKeyPress(onKey, active) {
  useEffect(() => {
    if (!active) return;

    function handleKeyDown(e) {
      const key = e.key.toUpperCase();
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        onKey(key);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKey, active]);
}
