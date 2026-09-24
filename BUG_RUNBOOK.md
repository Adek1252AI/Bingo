# Bingo Website — Bug Runbook

> Living document of known bugs, their status, and how to reproduce/fix them.
> Updated as bugs are found, reproduced, fixed, or closed.

---

## How to use this runbook

Each bug entry follows this format:

```
### [Bug title]

- **Status:** open / reproduced / fixed / closed
- **Found by:** who discovered it
- **When:** date found
- **Severity:** critical / major / minor / cosmetic
- **Environment:** browser, OS, build mode (dev / production / static export)

#### What happens
Description of the bug — what the user sees/experiences.

#### Expected behavior
What should happen instead.

#### How to reproduce
Step-by-step steps to trigger the bug.

#### Root cause (if known)
What's causing it — code file, logic error, missing handling, etc.

#### Fix (if applied)
What was changed to fix it. File(s) modified, approach taken.

#### Verification
How to confirm the fix works.

#### Notes
Any additional context — related bugs, edge cases, workarounds.
```

---

## Bugs to fix

[Add bugs here using the format below. Each bug should have enough detail that the agent can reproduce it without asking for clarification.]

### Shared board loaded message updates when topic changes

- **Status:** open
- **Priority:** medium
- **Environment:** browser (Chrome), static export build (`npm run build` + serve `out/`)
- **Found by:** Adrian
- **When:** 2026-09-24

#### What happens
After opening a shared board link (e.g. from "Share this board" → copy link → open in new tab), the page shows a green-highlighted confirmation: "Loaded shared board — topic: Star Wars. Same words as your friend, your own cell arrangement." This is correct and desirable.

However, if the user then changes the bingo topic using the topic picker, that green confirmation message also updates to reflect the new topic selection. The message should remain unchanged — it's a one-time confirmation that a shared board was loaded, not a live status indicator that should react to topic changes.

#### Expected behavior
The "Loaded shared board" green message should appear once when a shared board is loaded, and stay as-is regardless of subsequent topic changes. If the user changes the topic, the message should either:
- Remain unchanged (keep showing the original shared board load confirmation), or
- Be cleared when the user explicitly generates a new board (not when they just pick a different topic)

#### How to reproduce
1. Open the Bingo site
2. Pick a topic (e.g. Star Wars) and generate a board
3. Click "Share this board", copy the link
4. Open the copied link in a new tab — confirm the green "Loaded shared board" message appears
5. On that same page, use the topic picker to select a different topic
6. Observe: the green message updates to reflect the new topic — this is the bug

#### Where to look
- `src/app/page.tsx` — state management for the shared board loaded message and topic change handler
- Any state variable that holds the "shared board loaded" confirmation text — check if it's being reset/overwritten when the topic changes

#### Notes
The message is a confirmation of a past action (loading a shared board), not a live indicator. It should not be coupled to the topic selection state.

---

### Buttons / board render on the left instead of centered (t_b193245e)

- **Status:** fixed
- **Priority:** major
- **Environment:** all browsers, static export build (`npm run build` + serve `out/`)
- **Found by:** coder (kanban t_b193245e)
- **When:** 2026-09-24

#### What happens
The 5x5 board (25 cell buttons) renders hugging the left edge of the page with ~275px of empty space on the right. Card and section padding appears collapsed (headings flush against card borders), and Tailwind spacing utilities (`mt-*`, `p-4`, `px-*`) have no visible effect.

#### Expected behavior
The board and all buttons center horizontally within the page container; utility padding/margins apply normally.

#### How to reproduce (pre-fix)
1. Build + serve the static export
2. Pick a topic and click "Generate Board"
3. Observe the board grid on the left half of the page

#### Root cause
`src/app/globals.css` declared an unlayered universal reset:

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
```

In the CSS cascade, **unlayered rules beat every `@layer` rule regardless of specificity**. This reset silently defeated all Tailwind utilities in `@layer utilities`: `mx-auto` on the board grid computed to `0px` (so `max-w-[600px]` + `mx-auto` never centered it), and `p-4`/`px-4`/`mt-*` were zeroed site-wide. Tailwind v4's preflight (via `@import "tailwindcss"`) already provides the identical reset inside `@layer base`, where utilities can override it.

#### Fix
Removed the unlayered `*` reset from `src/app/globals.css` (globals.css:288). Tailwind v4 preflight provides the standard reset inside `@layer base`, correctly layered so `@layer utilities` wins.

#### Verification
- New regression tests: `src/app/globals.test.ts` (no universal selector reset, no unlayered margin/padding zeroing, bento-grid centering anchor intact) and a BoardGrid centering-class guard in `src/interface/components/BoardGrid.test.tsx`.
- Playwright viewport sweep (375/430/768/1272/1920px): board grid, cell buttons, and Generate button all center with offset 0 against the body content box; no horizontal overflow.
- Win modal: dialog centered (offset 0), padding 32px, Play-again button centered within it.
- Pixel analysis of screenshots: board spans 336–935px in a 1272px viewport, 336px margins both sides.
- Full suite: 159/159 tests pass; `npm run build` passes.

#### Notes
The earlier "center the board" attempts (JSX reorder, `grid-column: 1 / -1`, `mx-auto` classes) were correct in intent but could never work while the unlayered reset outranked the utilities layer. Any future CSS added at the top level of globals.css must not reset margin/padding — guarded by `src/app/globals.test.ts`.

