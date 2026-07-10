import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../styles/EasterEgg.module.css';

const COLORS = ['#00f5ff', '#ff00ff', '#ffff00', '#ff2244', '#ffffff'];
const MESSAGE = 'яж му кура симитли';

// A single spark in a firework burst.
function makeParticle(x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 4;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    decay: 0.008 + Math.random() * 0.012,
    color,
    size: 1.5 + Math.random() * 2,
  };
}

export default function EasterEgg() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(0);
  const spawnRef = useRef(0);

  const launchBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = canvas.width * (0.15 + Math.random() * 0.7);
    const y = canvas.height * (0.1 + Math.random() * 0.5);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const count = 40 + Math.floor(Math.random() * 30);
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(makeParticle(x, y, color));
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let last = performance.now();
    const tick = (now) => {
      // Fade the previous frame for glowing trails.
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(6, 6, 18, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      spawnRef.current += now - last;
      last = now;
      if (spawnRef.current > 450) {
        spawnRef.current = 0;
        launchBurst();
      }

      ctx.globalCompositeOperation = 'lighter';
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.04; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(tick);
    };

    // A couple of instant bursts so it kicks off with a bang.
    launchBurst();
    launchBurst();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      particlesRef.current = [];
    };
  }, [active, launchBurst]);

  return (
    <>
      {active && <canvas ref={canvasRef} className={styles.canvas} />}

      {active && (
        <div className={styles.message} onClick={() => setActive(false)}>
          <span className={styles.messageText}>{MESSAGE}</span>
        </div>
      )}

      <button
        className={styles.trigger}
        onClick={() => setActive((v) => !v)}
        aria-label="secret"
        title="?"
      >
        ?
      </button>
    </>
  );
}
