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

