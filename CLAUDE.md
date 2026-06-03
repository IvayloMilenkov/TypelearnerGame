# KEYBOMB — Developer Guide

Typing skill game: letters/words fall from the top of the screen, player presses the matching key(s) to destroy them. Built with React + Vite. Hosted at https://github.com/IvayloMilenkov/TypelearnerGame.

## Commands

```bash
npm run dev      # dev server (usually :5174 if :5173 is taken)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Architecture

### Phase flow (App.jsx)
```
menu → playing → gameover
           ↑         |
           └─────────┘ (play again)
           ↑
     pause → resume (Escape / RESUME btn)
     pause → menu   (QUIT TO MENU btn)
```

`App.jsx` owns `phase`, `mode`, and `highScore`. High scores are stored per-mode in `localStorage` under keys `keybomb_hs_easy`, `keybomb_hs_normal`, `keybomb_hs_expert`.

### Game modes

| Mode | Content | Spawn | Fall |
|---|---|---|---|
| `easy` | Single A-Z letters | 1400→400ms | 5.0→1.8s |
| `normal` | 3–5 char words | 2200→1000ms | 7.0→3.5s |
| `expert` | 6–12 char words | 3000→1500ms | 10.0→5.0s |

Difficulty steps up every 30 seconds (3 levels total). `src/utils/difficulty.js` computes everything from `(elapsedSeconds, mode)`.

### Letter entity shape

All modes share the same object shape — easy mode is just a word of length 1:
```js
{
  id,            // unique int (module-level counter)
  text,          // the full word or single char, e.g. 'BRAVE' or 'K'
  typedCount,    // chars correctly typed so far (0 → text.length)
  x,             // left position as % of viewport (5–88% easy, 5–62% word modes)
  fallDurationSec,
  color,         // '#00f5ff' cyan | '#ffff00' yellow | '#ff00ff' magenta
  destroyed,     // bool — triggers explosion animation in FallingLetter
}
```

### Key files

| File | Role |
|---|---|
| `src/App.jsx` | Phase state machine, mode + high score management |
| `src/components/Game.jsx` | RAF game loop, spawning, key matching, pause, lives |
| `src/components/FallingLetter.jsx` | CSS fall animation, explosion portal, word char highlighting |
| `src/components/HUD.jsx` | Score / lives / combo display |
| `src/components/Menu.jsx` | Mode card selector + start |
| `src/components/PauseMenu.jsx` | Pause overlay (Resume / Quit) |
| `src/components/GameOver.jsx` | End screen with stats |
| `src/hooks/useKeyPress.js` | Global A-Z keydown listener, enabled/disabled by `active` flag |
| `src/utils/difficulty.js` | `getDifficulty(elapsed, mode)` + `getLetterColor()` |
| `src/utils/wordLists.js` | `normalWords` (3–5 chars), `expertWords` (6–12 chars) arrays |
| `src/styles/global.css` | Reset, CSS vars, starfield background |
| `src/styles/*.module.css` | Per-component scoped CSS |

### Game loop (Game.jsx)

The RAF loop runs continuously even while paused — it just skips game logic when `pausedRef.current` is true. This avoids needing to restart the RAF on unpause.

```
tick():
  if !gameActiveRef → return (game over / unmounted)
  if !pausedRef:
    elapsed = (now - startTime - totalPausedMs) / 1000
    difficulty = getDifficulty(elapsed, mode)
    if level changed → show banner
    if time to spawn → spawnLetter(difficulty)
  requestAnimationFrame(tick)
```

**StrictMode gotcha**: The cleanup sets `gameActiveRef.current = false`. The effect resets it to `true` at the top so the second StrictMode invocation works.

**Pause time accounting**: `totalPausedMsRef` accumulates paused durations so elapsed time (and thus difficulty) is unaffected by pausing.

### Key matching (Game.jsx `handleKey`)

```
candidates = letters where text[typedCount] === key && !destroyed
if none → easy mode resets combo; word modes do nothing
target = candidate with highest typedCount (most progress)
increment target.typedCount
if complete → mark destroyed, update score/combo
```

Scoring: base points × combo multiplier.
- easy: 10 pts/letter
- normal: 30 pts/word  
- expert: 60 pts/word
- multiplier: `combo >= 3 ? floor(combo/3) + 1 : 1`

### FallingLetter animation

Fall is a pure CSS `@keyframes fall` (`translateY(-80px → 100vh)`). Duration set inline. `onAnimationEnd` → calls `onMiss(id)` if not already destroyed.

Destruction flow:
1. Parent sets `destroyed: true`
2. `useEffect` fires → captures `getBoundingClientRect()` → stores in `explodeRect`
3. Letter div goes `opacity: 0`
4. Explosion `<div>` is rendered via `createPortal` at the captured fixed position
5. `setTimeout(onDestroyDone, 400)` → parent removes letter from state

During pause, `animationPlayState: 'paused'` is applied inline, freezing letters in place.

### Word mode character display (FallingLetter.jsx)

```jsx
text.split('').map((ch, i) => (
  <span className={i < typedCount ? 'typed' : i === typedCount ? 'active' : 'upcoming'}>
    {ch}
  </span>
))
```
- `typed`: opacity 0.2
- `active`: full brightness, slow pulse animation
- `upcoming`: opacity 0.7

## Visual design

- **Palette**: `#060612` bg, `#00f5ff` cyan, `#ff00ff` magenta, `#ffff00` yellow, `#ff2244` red
- **Font**: Courier New monospace throughout
- CSS custom properties defined in `src/styles/global.css`
- Starfield: 20 radial-gradients on `body::before`
- All animations are CSS keyframes; no animation library

## Planned / future work

- User profiles
- Leaderboards
- GitHub Actions / GitHub Pages deployment
- Sound effects (Web Audio API)
- More word lists / difficulty tuning
