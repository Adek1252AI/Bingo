import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const cssPath = resolve(dirname(fileURLToPath(import.meta.url)), 'globals.css');
const css = readFileSync(cssPath, 'utf8');

/**
 * CSS-cascade regression tests (t_b193245e — "buttons sit on the left").
 *
 * Root cause: globals.css declared a universal reset
 * `* { box-sizing: border-box; margin: 0; padding: 0 }` OUTSIDE any
 * @layer. Unlayered styles win over ALL @layer rules regardless of
 * specificity, so this reset silently beat every Tailwind utility in
 * `@layer utilities` — `mx-auto` on the board grid computed to 0 (board
 * + its 25 cell buttons rendered on the left half of the page), and
 * `p-4`/`px-4`/`mt-*` spacing on cards and buttons was zeroed site-wide.
 *
 * Tailwind v4's preflight (pulled in by `@import "tailwindcss"`) already
 * provides the identical reset inside `@layer base`, where utilities can
 * override it. These tests keep a future unlayered reset from sneaking
 * back in and re-breaking every margin/padding utility.
 */

/** Strip comments so commented-out rules can't satisfy the assertions. */
const uncommented = css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('globals.css cascade hygiene', () => {
  it('declares no universal (*) selector reset', () => {
    // Any `* { ... }` rule resets every element; Tailwind's preflight
    // already provides the standard reset inside @layer base, where
    // utilities can override it. A second one — especially unlayered —
    // defeats @layer utilities (mx-auto, p-4, mt-*, ...).
    expect(uncommented).not.toMatch(/^\s*\*\s*\{/m);
  });

  it('declares no unlayered rule that zeroes margin or padding', () => {
    // Even a compound selector (e.g. `html, body, *`) with margin:0 /
    // padding:0 outside @layer would beat the utilities layer.
    // `margin: 0 auto` (centering) is fine — only exact-zero resets
    // are the hazard.
    const offenders = topLevelRules(uncommented)
      .filter(([, body]) =>
        /(?:^|;)\s*(?:margin|padding)(?:-(?:inline|block|left|right|top|bottom))?\s*:\s*0\s*(?:;|$)/m.test(
          body
        )
      )
      .map(([selector]) => selector.replace(/\s+/g, ' ').trim().slice(0, 80));
    expect(offenders).toEqual([]);
  });

  it('keeps the bento-grid page container centered (margin: 0 auto)', () => {
    // The page's centering anchor: .bento-grid { margin: 0 auto }.
    expect(uncommented).toMatch(/\.bento-grid\s*\{[^}]*margin:\s*0\s+auto/m);
  });
});

/**
 * Parse top-level `selector { body }` rules, ignoring at-rule blocks
 * (@layer, @media, @theme, ...) whose contents are layered/scoped and
 * therefore lose to nothing in the cascade comparison we care about.
 */
function topLevelRules(css: string): Array<[string, string]> {
  const rules: Array<[string, string]> = [];
  // Remove at-rule blocks (with up to two levels of nested braces).
  let flattened = css.replace(/@[a-z-]+[^{;]*\{((?:[^{}]|\{[^{}]*\})*)\}/g, '');
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(flattened))) {
    rules.push([m[1], m[2]]);
  }
  return rules;
}
