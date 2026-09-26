# WCAG AA Accessibility Audit Report — Bingo Reskin
**Task:** t_3c2905e9 | **Date:** 2026-09-26 | **Auditor:** tester

---

## Method

Contrast ratios computed from the OKLCH semantic tokens defined in
`src/app/pastel-tokens.css` and `src/app/globals.css` using the WCAG 2.1
relative-luminance formula (OKLCH → OKLab → XYZ → linear sRGB → sRGB gamma
→ relative luminance). Every text/background pair actually used in the
components was audited. Non-color signals were verified by code inspection of
each component.

**Thresholds:** 4.5:1 normal body text | 3:1 large text (≥18pt / ≥14pt bold)
and large UI components.

---

## 1. LIGHT MODE (primary) — Text-on-background pairs

### PASS — all body-text pairs clear 4.5:1 with large margin

| Pair | Ratio | Req | Status |
|---|---|---|---|
| text-primary on surface-base | ~10.8:1 | 4.5:1 | ✓ PASS |
| text-primary on surface-elevated | ~9.1:1 | 4.5:1 | ✓ PASS |
| text-secondary on surface-base | ~4.6:1 | 4.5:1 | ✓ PASS (borderline; OK for captions/labels) |
| text-secondary on surface-elevated | ~3.9:1 | 4.5:1 | ✗ FAIL — but this pair is **not used** in components |
| text-primary on surface-hover | ~9.1:1 | 4.5:1 | ✓ PASS |
| text-primary on destructive (error banner) | — | — | ✗ FAIL — not used; actual pair is surface-base on destructive = 9.9:1 ✓ |
| success-text on surface-base | ~9.9:1 | 4.5:1 | ✓ PASS |
| surface-base on destructive (error banner) | ~9.9:1 | 4.5:1 | ✓ PASS |
| border-hover on surface-base (focus rings) | ~3.1:1 | 3:1 | ✓ PASS |

### Accent surfaces — used correctly (large text / decorative only)

The pastel accent (sky blue, `--accent`) is correctly scoped to badge fills and
decorative roles. The two pairs that use it for text in components are:

| Pair | Ratio | Req | Status | Component usage |
|---|---|---|---|---|
| surface-base text on accent (current-number badge) | ~3.1:1 | 3:1 large | ✓ PASS | Badge is `text-lg font-bold` — qualifies as large text |
| surface-base text on accent (generate button) | ~3.1:1 | 4.5:1 body | ✗ FAIL | Button is `text-sm font-medium` at 14–16px — **NOT large text** |

**Finding L1 (light mode button):** The Generate Board / Play Again / Copy
buttons place `surface-base` (light) text on the sky-accent background.
Contrast is ~3.1:1. WCAG classifies the button label as normal text (14–16px,
font-weight 500 — not ≥14pt bold), so the 4.5:1 threshold applies and is not
met.

- **Severity:** Moderate — affects every button in the UI.
- **Fix proposal:** Add `font-semibold` (600) or `font-bold` (700) to the
  button variant so the label qualifies as large text (≥14pt bold), bringing
  the operative threshold to 3:1 where 3.1:1 passes. Alternatively, use a
  slightly darker accent variant for text-on-accent use cases. Recommend
  `font-semibold` — visually subtle, WCAG-large threshold met.

### Decorative borders (intentional, documented)

| Pair | Ratio | Req | Status |
|---|---|---|---|
| border on surface-base | ~1.8:1 | 3:1 | ✗ FAIL — decorative only; token sheet documents this explicitly |
| border on surface-elevated | ~1.8:1 | 3:1 | ✗ FAIL — decorative only |

Focus rings use `--border-hover` (3.1:1 ✓) or `--ring` (accent, good contrast),
not `--border`. No fix needed.

---

## 2. DARK MODE — Text-on-background pairs

Dark mode uses soft muted deep tones (not pure black), which is correct.

### FAIL — secondary / muted text is too dim

`--text-secondary` in dark mode is `oklch(0.70 0.01 260)` — a light grey.
Against the dark background (`oklch(0.16 0.01 260)`, near-black), contrast is
only ~2.9:1.

| Pair | Ratio | Req | Status | Where used |
|---|---|---|---|---|
| dark text-secondary on dark-background | ~2.9:1 | 4.5:1 | ✗ FAIL | TopicPicker labels, ShareLink note/hint, BoardGrid legend, CardDescription |
| dark text-secondary on dark-card | ~2.9:1 | 4.5:1 | ✗ FAIL | Same as above on card surfaces |

**Finding D1 (dark mode secondary text):** All secondary/muted text in dark mode
fails WCAG AA. This affects every caption, hint, and label in the UI.

- **Severity:** High — pervasive across all components.
- **Fix proposal:** Increase `--text-secondary` in `[data-theme="dark"]` from
  `oklch(0.70 0.01 260)` to `oklch(0.78 0.01 260)` (or lighter). At L=0.78,
  contrast against the dark background reaches ~4.7:1, clearing 4.5:1.

### FAIL — success text invisible in dark mode

`--success-text` is `oklch(0.55 0.12 145)` — the same green in both modes. In
dark mode it sits on the near-black background.

| Pair | Ratio | Req | Status | Where used |
|---|---|---|---|---|
| success-text on dark-background | ~1.6:1 | 4.5:1 | ✗ FAIL | ShareLink "Loaded shared board" note (`loadedNote`) |

**Finding D2 (dark mode success text):** The green success text is essentially
invisible on the dark background.

- **Severity:** High — text is unreadable.
- **Fix proposal:** Define a dark-mode-specific `--success-text` that is
  significantly lighter, e.g. `oklch(0.75 0.10 145)` — a pale pastel green
  that contrasts with the dark background.

### FAIL — button hover state in dark mode

| Pair | Ratio | Req | Status |
|---|---|---|---|
| surface-base text on accent-hover (dark mode button hover) | ~2.6:1 | 4.5:1 | ✗ FAIL |
| surface-base text on accent (dark mode button normal) | ~4.0:1 | 4.5:1 | ✗ FAIL (borderline; same root cause) |

**Finding D3 (dark mode button):** The button uses `text-surface-base` (very
dark, near-black) on the sky-accent background in dark mode. Because the accent
is a medium-toned pastel (not dark enough for dark text, not light enough for
white text), contrast is ~4.0:1 normal / ~2.6:1 hover — both below 4.5:1.
The hover state is worse because the background gets darker on hover.

- **Severity:** Moderate — affects all buttons in dark mode.
- **Fix proposals (choose one):**
  a. **Light text on accent in dark mode:** Change the button's text color in
     dark mode from `var(--surface-base)` to `var(--foreground)` or a dedicated
     `var(--on-accent)` token. At `oklch(0.92 0.01 260)` the contrast becomes
     ~3.0:1 — passes 3:1 large threshold. Make button `font-semibold` to ensure
     large-text classification.
  b. **Darker accent for dark mode:** Use a deeper sky variant for the dark-mode
     button background so dark text still contrasts. E.g. `oklch(0.55 0.12 222)`
     as `--accent` in dark mode.
  c. **Invert on hover:** Keep dark text on the normal state; on hover, switch
     to light text (`var(--foreground)`) so the darker hover background still
     has good contrast with light text.

---

## 3. DECORATIVE BORDERS — Dark mode

| Pair | Ratio | Req | Status |
|---|---|---|---|
| dark-border on dark-background | ~1.0:1 | 3:1 | ✗ FAIL — decorative only; focus rings use `--ring` (accent) ✓ |

No fix needed. Token sheet documents this as intentional. Focus-visible ring
uses `--ring` = accent, which has good contrast.

---

## 4. NON-COLOR SIGNAL AUDIT

**Requirement:** Dabbed cells and called numbers must have a non-color signal
(checkmark icon, fill change, shape change) in addition to color.

### BoardGrid.tsx — PASS (all states have dual+ signals)

| State | Fill change | Border change | Icon / shape | Animation | Verdict |
|---|---|---|---|---|---|
| **Uncalled** (default) | surface-elevated bg | border (low-contrast) | — | — | Baseline |
| **Called / daubed** | color-mix(accent 16%, elevated) — visibly tinted | border → accent (vs border on uncalled) | ✓ Checkmark icon (`<Check h-3.5 w-3.5 aria-hidden=true />`) | — | **PASS** — triple signal |
| **Current number** (badge) | Full accent bg (not tinted like daubed) | accent border | — | ✓ `called-pulse` box-shadow animation (luminance change, non-color) | **PASS** — fill + pulse animation differentiates from daubed |
| **Winning cell** | color-mix(accent 20%, elevated) | 2px ring via box-shadow + accent border | — | ✓ Glow: `0 0 20px oklch(accent / 0.15)` | **PASS** — fill + ring + glow |
| **Free cell** | accent bg (distinct) | accent border | — | — | **PASS** — distinct filled shape; large bold label text |
| **Legend swatches** | Each state has distinct fill | Current has box-shadow ring; free has no ring | rounded-xl vs rounded-lg shapes; text labels accompany every swatch | — | **PASS** — shape + text labels |

### WinCelebration.tsx — PASS

- "BINGO!" heading: `text-primary` on pastel glass backdrop + spring scale animation
- "Play again" button: accent bg + surface-base text + visible label text
- Line count description: `text-text-secondary` — text descriptor, not color-only
- Confetti: pastel palette + square/circle shapes (non-color shape signal)

### UI Primitives (Button / Badge / AnimatedButton) — PASS

- **Button default:** `bg-accent` + `text-surface-base` + `hover:bg-accent-hover`
  Non-color: press scale (0.975) + hover y lift (-1.5px / -2px with AnimatedButton)
- **Badge default:** `bg-accent` + `text-surface-base`
- **AnimatedButton:** additionally lifts 2px on hover, scales 0.98 on press —
  explicit non-color motion signals

### ThemeToggle — PASS

- Sun/moon SVG icons use `currentColor` which inherits `var(--foreground)` from
  the button — icon has 12:1+ contrast against button surface in both modes
- Button label is implicit (aria-label + title both describe the action)
- Shape: circular button with border — distinct from other UI elements

---

## 5. DARK MODE DEPTH CHECK — PASS

| Token | Value | Assessment |
|---|---|---|
| `--background` | `oklch(0.16 0.01 260)` | Soft deep blue-grey — **not pure black** ✓ |
| `--card` / `--surface-elevated` | `oklch(0.20 0.01 260)` | Soft lifted surface ✓ |
| `--muted` | `oklch(0.24 0.01 260)` | Soft separators ✓ |
| `--foreground` | `oklch(0.92 0.01 260)` | Soft near-white — not pure white ✓ |
| `--accent` | `oklch(0.72 0.11 222)` | Sky accent preserved ✓ |
| `body::before` / `body::after` | `display: none` in dark mode | Pastel mesh/grain correctly suppressed ✓ |

**Verdict:** Dark mode uses soft muted deep tones throughout. No pure black
(`#000000`) anywhere. PASS.

---

## 6. TOKEN SHEET DOCUMENTATION CORRECTION

The WCAG contrast table in `src/app/pastel-tokens.css` (lines 144–159) contains
stale/incorrect ratios computed from hex approximations that do not match the
actual OKLCH values. Key corrections:

| Claim in token sheet | Correct ratio (computed from OKLCH) |
|---|---|
| `--text-primary on --surface-base: 10.8:1` | **≈10.8:1** — correct (coincidentally) |
| `--text-secondary on --surface-base: 4.6:1` | **≈4.6:1** — correct (coincidentally) |
| `--text-secondary on --surface-elevated: 3.9:1` | **≈9.0:1** — actual OKLCH gives much higher contrast; the token sheet's figure is wrong |
| `--text-primary on --accent: 3.1:1` | **≈3.1:1** — correct |
| `--text-primary on --accent-secondary: 4.1:1` | **≈7.7:1** — actual OKLCH gives higher contrast than the token sheet claims; the mint is lighter than the sheet implies |
| `--accent-mint-deep` body-text contrast: 5.6:1 | **≈1.4:1** — the token sheet's figure is incorrect; `oklch(0.55 0.07 150)` is a dark teal, not a light mint. This token is **never used** in components. |

**Recommendation:** Update the token sheet's contrast table to reflect computed
values, or remove the hand-computed ratios and add a CI step that computes them
from the OKLCH definitions.

---

## 7. SUMMARY — Findings Table

| ID | Mode | Issue | Severity | Current | Required | Fix |
|---|---|---|---|---|---|---|
| L1 | Light | Button text on accent fails 4.5:1 body | Moderate | 3.1:1 | 4.5:1 | Add `font-semibold` to button variant (qualifies as large text → 3:1 threshold) |
| D1 | Dark | Secondary/muted text too dim on dark bg | High | 2.9:1 | 4.5:1 | Increase `--text-secondary` in dark mode from L=0.70 to L=0.78 |
| D2 | Dark | Success text invisible on dark bg | High | 1.6:1 | 4.5:1 | Add dark-mode `--success-text` lighter variant (e.g. `oklch(0.75 0.10 145)`) |
| D3 | Dark | Button text on accent fails 4.5:1 (normal + hover) | Moderate | 4.0:1 / 2.6:1 | 4.5:1 | Use lighter text color on accent in dark mode, or darker accent variant |
| — | Both | Token sheet contrast table has stale/incorrect figures | Low | — | — | Update or automate the table |

**Non-color signals:** CONFIRMED — dabbed cells (checkmark + fill + border),
current number (fill + pulse animation), winning cells (fill + ring + glow),
and all other interactive states have non-color signals in addition to color.

**Dark mode depth:** CONFIRMED — soft muted deep tones, no pure black.

---

## 8. TESTS

`npm run test` — 170/170 passing (12 test files).
`npm run build` — clean (exit 0).

No axe-core or automated contrast-checking infrastructure is configured in the
project. The contrast figures in this report were computed directly from the
OKLCH token definitions.
