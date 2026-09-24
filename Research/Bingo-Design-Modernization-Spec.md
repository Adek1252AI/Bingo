# Bingo Website Modernization — Implementation Spec

> Agent execution spec. Based on research findings ingested into the LLM vault
> (`concepts/bingo-design-modernization-research.md`, `raw/articles/bingo-design-modernization-findings.md`).
> Follow this spec in order. Do not skip steps. Report completion for each step.

---

## Context

- **Project:** Bingo — word-based bingo game website
- **Stack:** Next.js 15 + React 18 + TypeScript (strict) + Tailwind CSS
- **Architecture:** Clean Architecture (domain/, application/, infrastructure/, interface/)
- **Repo:** `/home/adek/Projects/Hermes/Bingo/`
- **Board:** kanban board `bingo`, card `t_f07ed6bf` (research, done)
- **Reference files:**
  - `concepts/bingo-design-modernization-research.md` — synthesized findings
  - `raw/articles/bingo-design-modernization-findings.md` — full raw research (GitHub repos, best practices, recommendations)
  - `BUG_RUNBOOK.md` — bug runbook in project root

---

## Step 1: Read the research

Before writing any code, read these files to understand the full scope:

1. `concepts/bingo-design-modernization-research.md` — synthesized summary (start here)
2. `raw/articles/bingo-design-modernization-findings.md` — full raw research (GitHub repos, best practices, recommendations)

Understand the recommendations before implementing anything.

---

## Step 2: Install shadcn/ui

**What:** Set up shadcn/ui as the base component layer.

**Why:** 83+ accessible React components on Radix + Tailwind. Copy-paste model — you own the code, no npm lock-in. Built-in dark mode via CSS variables. Everything else in the design builds on this foundation.

**Commands:**
```bash
npx shadcn@latest init
```

When prompted:
- Style: `New York` or `Default` (both work; New York has a cleaner modern look)
- Base color: pick a dark base that matches the game aesthetic
- CSS variables: yes (this enables the dark/light mode and theming)

Then add components as needed:
```bash
npx shadcn@latest add button card dialog sheet badge table toast
```

**Verification:** Components render. `npx tsc --noEmit` passes. `npm run build` passes.

---

## Step 3: Redefine the color system with OKLCH tokens

**What:** Replace hardcoded hex values with semantic CSS custom properties using OKLCH for the accent color.

**Why:** OKLCH gives perceptually uniform tints/shades. One accent token derives the whole palette. Dark/light mode becomes a variable swap, not a rewrite.

**What to do:**

1. Create or update the global CSS file (e.g. `src/app/globals.css` or a new `src/interface/lib/theme.css`) with these tokens:

```css
:root {
  /* Surfaces */
  --surface-base: #0f172a;        /* slate-900 — deep blue-black */
  --surface-elevated: #1e293b;    /* slate-800 — cards, panels */
  --surface-hover: #334155;       /* slate-700 — hover state */

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-tertiary: rgba(255, 255, 255, 0.4);

  /* Accent — OKLCH, pick ONE primary */
  --accent: oklch(0.75 0.18 60);        /* amber — warm, premium */
  --accent-hover: oklch(0.78 0.19 60);
  --accent-muted: rgba(255, 200, 100, 0.15);

  /* Borders */
  --border: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(255, 255, 255, 0.2);

  /* Glow */
  --glow: 0 0 20px oklch(0.75 0.18 60 / 0.4);

  /* Radii */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);

  /* Motion */
  --duration-fast: 80ms;
  --duration-normal: 150ms;
  --duration-slow: 250ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Light mode (warm neutrals, not pure inversion) */
.light {
  --surface-base: #FAFAF5;
  --surface-elevated: #F8F5F0;
  --surface-hover: #EDE8E0;
  --text-primary: #1a1a1a;
  --text-secondary: rgba(26, 26, 26, 0.7);
  --text-tertiary: rgba(26, 26, 26, 0.4);
  --border: rgba(0, 0, 0, 0.1);
  --border-hover: rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

2. Replace hardcoded colors in existing components with `var(--*)` references.

3. Add dark/light mode support. Since we use Next.js, either:
   - Use the `next-themes` package for SSR-safe toggling, OR
   - Use CSS `light-dark()` function where supported (simpler, no JS)

**Recommendation:** Start with CSS `light-dark()` for simplicity. Add `next-themes` later if a manual toggle is needed.

**Verification:** The page renders with the new dark color scheme. No hardcoded hex values remain in component styles. Light mode works if implemented.

---

## Step 4: Install animation libraries

**What:** Install Framer Motion and canvas-confetti.

**Why:** Framer Motion handles all component-level animations (card daub, modal, entrance stagger, button interactions). canvas-confetti handles the win celebration.

**Commands:**
```bash
npm install framer-motion
npm install canvas-confetti
```

**Optional (from research):**
```bash
# For pre-built animation components (copy-paste style)
# The dotmack/framer-motion-animations — 90+ components, copy-paste into project
# @philiprehberger/framer-motion-presets — stagger containers, counter animations, modal variants
```

**Verification:** `npm run build` passes. `import { motion } from "framer-motion"` works. `import confetti from "canvas-confetti"` works.

---

### 5.1 Cell card styles

- Rounded corners: `--radius-lg` (0.75rem) or `--radius-xl` (1rem)
- Subtle border: `var(--border)`
- Background: `var(--surface-elevated)` (not flat base)
- Internal padding: generous — the daub target must be large enough for a thumb
- Hover: `translateY(-2px)` + shadow lift + slight border brightening
- Press/tap: `scale(0.97)` + immediate feedback

### 5.2 Called number treatment

- Filled with `--accent` background + white text
- Add a checkmark icon or dauber-style pattern — color is NOT the only indicator (WCAG)
- Smooth transition from unmarked → called (color shift + scale)

### 5.3 Current number display (separate element, not part of the grid)

- Extra-large, high-contrast, the visual anchor of the screen
- Position: above or beside the grid (not inside it)
- Pulse/glow animation on call (Framer Motion: `scale` pulse + shadow glow)
- Uses `--font-mono` for a technical/readable number feel
- Should be visible at all times during gameplay — don't bury it under other UI

### 5.4 Free cell

- Visually distinct regardless of screen size
- "FREE" label centered, light text on dark background

**Implementation approach:**
- Use Framer Motion `motion.div` with `whileHover`, `whileTap`, `layout` for the cells
- Keep `transform` and `opacity` only for 60fps — no layout-triggering properties
- Respect `prefers-reduced-motion`: static highlight fallback, no animation

**Verification:** Cells look like cards. Hover/tap feedback is smooth (under 150ms). Called numbers are clearly distinguishable with an icon, not just color. Current number is prominent. Mobile: cells are tappable at 320px.

---

## Step 6: Add staggered card entrance on game start

**What:** Cards fade/slide in one by one when the page loads or a new board is generated.

**Why:** Immediate "this feels polished" impression on every game start.

**What to do:**

1. Wrap the bingo grid in a Framer Motion `AnimatePresence` / `staggerContainer` pattern:

```tsx
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,  // 50ms between each card
      delayChildren: 0.1,     // 100ms before first card
    },
  },
};

const card = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};
```

2. Apply `variants={container}` to the grid wrapper, `variants={card}` to each cell.

3. If a board is regenerated (new topic), re-trigger the entrance animation.

4. Respect `prefers-reduced-motion`: if reduced, render all cards visible immediately (no stagger).

**Verification:** Cards animate in one by one on page load. Total stagger under 400ms (50ms × 8 cells after first). Reduced-motion: instant render.

---

## Step 7: Add a win celebration

**What:** When a player completes a bingo (5 in a row, or any win condition), trigger a celebration.

**Why:** The single most memorable moment in the game. Worth investing in.

**What to do:**

1. **Detect the win** — this may already exist or need implementation. The spec assumes a win detection function exists or will be added.

2. **On win, trigger canvas-confetti** scoped to the bingo card area:

```tsx
import confetti from "canvas-confetti";

function triggerWinCelebration(canvasRef: HTMLCanvasElement | null) {
  if (!canvasRef) return;
  const canvas = canvasRef;
  confetti.create(canvas, {
    target: { x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2 },
    count: 150,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: ["#fbbf24", "#f59e0b", "#fff"],
    shapes: ["circle", "square"],
    ticks: 150,
    disableForReducedMotion: true,
  });
}
```

3. **Win modal (optional but recommended):**
   - Spring-in animation: scale from 0.95, fade-in, 300ms
   - "BINGO!" heading with the accent color
   - Player's score/results
   - Close button

4. **Win line highlight (complementary):**
   - The winning row/column/diagonal gets a glow/pulse animation
   - Brief (under 600ms), then settles

5. **Reduced-motion fallback:**
   - `canvas-confetti`: `disableForReducedMotion: true` (built-in)
   - Win modal: render static (no animation) if reduced motion
   - Win line: static highlight color, no pulse

**Verification:** On win, confetti fires from the card center. Win modal appears with spring animation. Win line highlights briefly. Reduced-motion: static badge, no confetti.

---

## Step 8: Add button micro-interactions

**What:** Every button gets hover lift + press feedback.

**Why:** Makes every tap feel responsive. Applies to CTA buttons, nav buttons, cell action buttons, modal actions.

**What to do:**

For shadcn/ui Button (or any button component):

```tsx
import { motion } from "framer-motion";

const AnimatedButton = ({ children, ...props }) => (
  <motion.button
    whileHover={{ y: -2, scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.15, ease: "ease-out" }}
    className="... existing button styles ..."
    {...props}
  >
    {children}
  </motion.button>
);
```

Or, if using CSS-only:

```css
.btn {
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.btn:active {
  transform: scale(0.97);
}
.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

**Verification:** Hover: button lifts 2px + shadow appears. Press: scale to 0.97. Focus: visible outline preserved. Reduced-motion: static hover/press states (no transform animation, but visual state change still present).

---

## Step 9: Add a sticky glassmorphic header (optional — for a lobby/dashboard shell, not the core game page)

**What:** A header that sticks to the top, shows/hides on scroll, with a frosted-glass treatment.

**Why:** Functional improvement (navigation always accessible) + polish. **Note:** this applies to a lobby/dashboard shell around the game, not the focused bingo board page itself. If the current site is a single focused board page, this step may be deferred until a lobby shell is wanted.

**What to do:**

1. **Header content:** Bingo logo/title, theme toggle (if implemented), any persistent nav.

2. **Glassmorphism style:**
   ```css
   .glass-header {
     background: rgba(15, 23, 42, 0.6);       /* dark base with transparency */
     backdrop-filter: blur(16px);
     -webkit-backdrop-filter: blur(16px);
     border-bottom: 1px solid var(--border);
   }
   ```

3. **Show/hide on scroll:**
   - On scroll down: header translates up and fades out (300-400ms)
   - On scroll up: header slides back in
   - Use Framer Motion `useScroll` + `useTransform` or a scroll-direction detector

4. **Height:** Under 10% viewport height on desktop (e.g. 64px), under 60px on mobile.

5. **Mobile:** Keep it compact. Don't let it eat into the game area.

**Verification:** Header sticks to top. Disappears on scroll-down, reappears on scroll-up. Glass effect visible (blur + transparency). Doesn't block game content on mobile.

---

## Step 10: Add a bento grid layout for the dashboard/lobby shell (optional — restructure around the board, not the board itself)

**What:** Restructure the lobby/dashboard area into a bento grid — the dominant 2025-2026 layout pattern.

**Why:** Creates natural focal points. Feels structured but not rigid. More polished than a flat vertical stack. **Note:** this is for the dashboard/lobby shell around the bingo board, not the board itself. The board stays compact (640px max-width is appropriate). If the current site is a single focused board page, this step may be deferred until a lobby shell is wanted. **If implemented, do this after Step 5** so the grid is laid out around real card components, not placeholders.

**What to do:**

1. **Identify the dashboard sections:** current number display, call history, stats/score, topic picker, share link controls, game controls.

2. **Arrange as a bento grid:**
   - Desktop: number card grid as the hero (large tile), sidebar with call history + stats + timer (smaller tiles). Each "information block" groups related content.
   - Tablet: grid narrows, sidebar moves below or collapses.
   - Mobile: number cards in a scrollable/zoomable grid; call history as a horizontal scroll strip; big CTA buttons (minimum 44×44px touch targets).

3. **CSS Grid implementation:**
   ```css
   .bento-grid {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
     gap: 1rem;
   }
   .bento-tile {
     background: var(--surface-elevated);
     border: 1px solid var(--border);
     border-radius: var(--radius-xl);
     padding: 1.5rem;
   }
   .bento-tile.featured {
     grid-column: span 2;
     grid-row: span 2;
   }
   ```

4. **Keep the bingo board itself compact** — the 640px max-width is appropriate. The bento grid is for the dashboard/lobby shell around the board, not the board itself.

**Verification:** Dashboard sections are arranged in a grid with varied tile sizes. Focal points (current number, game board) are larger tiles. Responsive: collapses gracefully on mobile.

---

## Step 11: Add a typography refresh

**What:** Upgrade fonts to a modern pairing with proper display treatment.

**Why:** Typography is the most visible design element. Fluid sizing alone makes the site feel modern.

**What to do:**

1. **Choose a font pairing:**
   - Option A (premium game feel): Bebas Neue (display/heading) + Inter (body)
   - Option B (technical/neon feel): Space Grotesk (heading) + JetBrains Mono (labels/numbers) + Inter (body)

   Recommend **Option A** for Bingo — the condensed display heading gives a game-identity feel.

2. **Install fonts:**
   ```bash
   # Bebas Neue + Inter via Google Fonts (or self-host for performance)
   # Add to layout.tsx metadata
   ```

3. **Set up semantic CSS font variables:**
   ```css
   :root {
     --font-display: "Bebas Neue", system-ui, sans-serif;
     --font-body: "Inter", system-ui, sans-serif;
     --font-mono: "JetBrains Mono", monospace;
   }
   ```

4. **Display type treatment:**
   - Apply `--font-display` to the Bingo wordmark/title
   - Tight tracking: `letter-spacing: -0.04em` on uppercase display headings
   - Hero display size: 3rem+ on desktop

5. **Fluid typography (recommended, not required):**
   ```css
   --fs-heading: clamp(1.5rem, 4vw, 3rem);
   --fs-body: clamp(0.875rem, 1.5vw, 1rem);
   ```

**Verification:** Fonts load. Display heading has tight tracking. Body text is readable. No fallback font flash (or acceptable FOIT/FOUT).

---

## Step 12: Add a dark/light mode toggle

**What:** Implement theme switching between dark (default) and light mode.

**Why:** Players expect theme switching. Dark mode is especially important for a game site played in the evening.

**What to do:**

1. If using CSS `light-dark()` (Step 3): the theme switch is a single class toggle on `<html>` or `<body>`:
   ```tsx
   // Toggle function
   document.documentElement.classList.toggle("light");
   ```

2. If using `next-themes` (more full-featured):
   ```bash
   npm install next-themes
   ```
   Then wrap the app in a `ThemeProvider` and add a toggle button.

3. **Store preference:** Save the selected theme in `localStorage` so it persists across sessions.

4. **Default to dark:** The site should load in dark mode first.

5. **Light mode design:** Warm neutrals (`#FAFAF5` / `#F8F5F0`) with the same accent — not a pure color inversion. Different surfaces, borders, shadows per theme (defined in Step 3's `:root.light` block).

**Verification:** Toggle switches between dark and light. Theme preference persists. Light mode has its own surfaces/borders/shadows (not just inverted dark mode).

---

## Step 13: Add visual polish (optional — at most one, unless specifically wanted)

**Grain/texture overlay:**
```css
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,..."); /* SVG noise */
  mix-blend-mode: overlay;
}
```
Adds depth to flat dark surfaces. Subtle — 3-6% opacity. **Mark as "skip unless specifically wanted" — low return, easy to add later.**

**Gradient text on the Bingo wordmark:**
```css
.wordmark {
  background: linear-gradient(135deg, var(--accent), oklch(0.7 0.25 340));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```
**Do this if time allows.** Cheapest polish item, highest flair. Makes the brand wordmark stand out immediately.

**Spinning gradient border on primary CTA:**
A decorative border that rotates through accent colors. **Mark as "skip unless specifically wanted" — decorative only, easy to add later if desired.**

These are polish — do them after the core steps (1-12) are solid.

---

## Step 14: Accessibility check

**What:** Verify the design meets accessibility baseline.

**Checklist:**
- [ ] `prefers-reduced-motion` respected everywhere (css media query + Framer Motion `useReducedMotion`)
- [ ] Color is not the only signal — called numbers have a checkmark/icon, not just color change
- [ ] `:focus-visible` outlines preserved on all interactive elements
- [ ] Text contrast meets WCAG AA (4.5:1 body, 3:1 large text)
- [ ] Touch targets ≥ 44px on mobile
- [ ] Bingo card legible and tappable at 320px
- [ ] Loading states have `aria-busy` + `aria-live`

**Verification:** Run through the checklist. Fix any failures.

---

## Step 15: Build, verify, commit, push

**Commands:**
```bash
npx tsc --noEmit      # TypeScript strict check
npm run build         # Static export succeeds
```

**Commit:**
```bash
git add -A
git commit -m "feat: modernize Bingo website design

- Set up shadcn/ui as base component layer (Button, Card, Dialog, Sheet, Badge, Table, Toast)
- Redefine color system with semantic OKLCH tokens + dark/light mode
- Install Framer Motion + canvas-confetti for animations and win celebration
- Redesign bingo number grid as card-based cells with hover/tap feedback
- Add staggered card entrance animation on game start
- Add BINGO! win celebration (canvas-confetti + win modal)
- Add button micro-interactions (hover lift + press feedback)
- Add sticky glassmorphic header with show/hide on scroll
- Add bento grid layout for the dashboard
- Refresh typography (Bebas Neue + Inter + JetBrains Mono)
- Add dark/light mode toggle with localStorage persistence
- Add visual polish: grain overlay, gradient text, spinning border CTA
- Accessibility: prefers-reduced-motion, focus-visible, WCAG AA contrast, touch targets

References:
- concepts/bingo-design-modernization-research.md
- raw/articles/bingo-design-modernization-findings.md"
```

**Push:**
```bash
git push origin master
```

**Verify on GitHub:** Check that the commit appears on https://github.com/Adek1252AI/Bingo/commits/master

**Verify on site:** https://adek1252ai.github.io/Bingo/ — the site should reflect the new design.

---

## Out of scope (do NOT implement)

- Custom word pools / AI-generated word lists (deferred — tracked in Features.md)
- Game mechanics changes (win rules, multi-player, scoring) — separate task
- Full particle backgrounds (too heavy for a bingo card UI)
- 3D/shader card effects (high cost, accessibility risk)
- Neumorphism (poor contrast for game UI)
- GSAP as primary animation library (Framer Motion covers what Bingo needs)
- Lobby/landing page shell (only if the site needs a public-facing home — separate decision)
- Winner/scoreboard screen (only if Bingo has multi-player sessions — separate decision)

---

## Completion criteria

All steps 1-15 completed in order. Build passes. Push landed on GitHub. Site reflects the new design. Accessibility checklist passed.

Report each step as completed, with any deviations or decisions made.
