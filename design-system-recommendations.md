╔═════════════════════════════════════════════════════════════════════════════════════════╗
║  DESIGN SYSTEM RECOMMENDATIONS — BINGO WORD GAME                                       ║
║  Source: ui-ux-pro-max generator output (design-system-bingo.txt)                      ║
║  Date: 2026-09-30                                                                        ║
║  Next task: t_279a7e9b (coder — apply changes)                                         ║
╚═════════════════════════════════════════════════════════════════════════════════════════╝

─────────────────────────────────────────────────────────────────────────────────────────────
1. RECOMMENDED STYLE
─────────────────────────────────────────────────────────────────────────────────────────────

  Name:   Minimalism & Swiss Style
  Mode:   Light + Dark both supported

  Keywords:   Clean, simple, spacious, functional, white space, high contrast,
              geometric, sans-serif, grid-based, essential

  Best for:   Enterprise apps, dashboards, documentation sites, SaaS platforms,
              professional tools

  Performance: cost low | drivers none
  Accessibility risk: low — requires contrast-text-4.5, keyboard nav,
              visible-focus, reduced-motion support

  Pattern:    Product Demo + Features
  Sections:   1. Hero → 2. Product video/mockup (center) →
              3. Feature breakdown → 4. Comparison (optional) → 5. CTA
  CTA layout: Video center + CTA right/bottom

  NOTE — existing project context:
  The Bingo project already has a pastel-oriented token system (soft sky blue +
  mint) and uses Outfit (headings) + Inter (body). The generator recommends
  Inter for both. Applying the new system means converging on Inter everywhere
  and adopting the generator's sharper, higher-contrast Swiss palette while
  keeping Tailwind CSS as the styling framework.

─────────────────────────────────────────────────────────────────────────────────────────────
2. COLOR PALETTE (hex codes)
─────────────────────────────────────────────────────────────────────────────────────────────

  ROLE                HEX       CSS VAR NAME           NOTES
  ──────────────────────────────────────────────────────────────────────────
  Primary             #15803D   --color-primary        Word green
  On Primary          #FFFFFF   --color-on-primary
  Secondary           #059669   --color-secondary      Deep green
  On Secondary        #000000   --color-on-secondary
  Accent / CTA        #D97706   --color-accent         Letter amber — used for
                                                         bingo markers, highlight
  On Accent / CTA     #000000   --color-on-accent
  Background          #FFFFFF   --color-background     Light mode canvas
  Foreground          #0F172A   --color-foreground     Near-black body text
  Card                #FFFFFF   --color-card
  Card Foreground     #0F172A   --color-card-foreground
  Muted               #F0F7F3   --color-muted          Subtle green-tinted bg
  Muted Foreground    #475569   --color-muted-foreground
  Border              #E2EFE7   --color-border         Very soft green tint
  Destructive         #DC2626   --color-destructive    Red for errors
  On Destructive      #FFFFFF   --color-on-destructive
  Ring (focus)        #15803D   --color-ring           Matches primary

  Palette rationale (from generator): "Word green + letter amber"
  — green is the bingo association, amber provides the warm CTA contrast.

  CONFLICT WITH EXISTING PROJECT:
  The current project uses a pastel sky/mint palette (--accent: oklch(0.72 0.11
  222deg) ≈ #7BAFD4, --accent-secondary: oklch(0.85 0.06 150deg) ≈ #A8D5C0).
  The generator recommends a saturated green primary with amber accent. The coder
  should decide: adopt the full new palette, or blend (keep pastel surfaces but
  use the new green primary + amber accent for interactive elements).

─────────────────────────────────────────────────────────────────────────────────────────────
3. TYPOGRAPHY
─────────────────────────────────────────────────────────────────────────────────────────────

  Pairing:   Inter / Inter  (single font family, multiple weights)

  Weights:   300 / 400 / 500 / 600 / 700

  Mood:      Dark, cinematic, technical, precision, clean, premium, developer,
             professional, high-end utility

  Best for:  Developer tools, fintech/trading, AI dashboards, streaming platforms,
             high-end productivity apps

  Google Fonts URL:
    https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap

  CSS Import:
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  CONFLICT WITH EXISTING PROJECT:
  Current project uses Outfit for headings (--font-heading) and Inter for body
  (--font-body). Generator recommends Inter for both. For the Swiss/minimal look
  the coder could either:
    a) Switch headings from Outfit → Inter (single-family Swiss style)
    b) Keep Outfit headlines + Inter body (hybrid approach, still clean)

  The single-family Inter approach better matches the "Swiss Style" recommendation.

─────────────────────────────────────────────────────────────────────────────────────────────
4. KEY EFFECTS
─────────────────────────────────────────────────────────────────────────────────────────────

  Hover transitions:   200–250ms, smooth, subtle
  General transitions: 150–300ms range for all interactive state changes
  Shadows:             Sharp / crisp if any — soft, diffused shadows OK but no
                       heavy drop shadows (Swiss/minimal style)
  Type hierarchy:      Clear, large-scale headings with tight body text
  Motion policy:       prefers-reduced-motion must be respected
  Loading:             Fast — no decorative loaders that delay interactivity

  Specific effects to apply:
    • Hover state transitions on cards, buttons, called-number chips
    • Smooth focus ring animation (--color-ring = #15803D)
    • Subtle scale/opacity micro-interactions on CTA buttons
    • Called-number highlight pulse (use --glow token if keeping pastel blend,
      or a green-tinted box-shadow with the new palette)

─────────────────────────────────────────────────────────────────────────────────────────────
5. ANTI-PATTERNS TO AVOID
─────────────────────────────────────────────────────────────────────────────────────────────

  1. Excessive decoration — no ornamental flourishes, decorative borders, or
     visual noise. Every element must earn its place.

  2. Complex shadows — avoid layered, multi-colored, or heavy drop shadows.
     Keep shadows sharp/defined or very subtle. No "card floating in space"
     effects.

  3. 3D effects — no depth simulation, no faux-3D buttons, no isometric
     illustrations. Flat, geometric, 2D only.

  Additional from the pre-delivery checklist:
    ✗ No emojis as icons — use SVG (Heroicons / Lucide)
    ✗ No cursor:default on clickable elements — always cursor:pointer
    ✗ No missing hover states — every interactive element needs one
    ✗ No light-mode text below 4.5:1 contrast
    ✗ No invisible focus states — keyboard nav must show focus rings
    ✗ No ignoring prefers-reduced-motion
    ✗ No untested responsive breakpoints — verify at 375px, 768px, 1024px, 1440px

─────────────────────────────────────────────────────────────────────────────────────────────
6. STACK-SPECIFIC GUIDANCE (Next.js 15 + React 18 + Tailwind CSS)
─────────────────────────────────────────────────────────────────────────────────────────────

  Although the generator output did not include an explicit --stack nextjs section,
  the recommended design system maps cleanly to the Bingo stack:

  a) Tailwind CSS v4 (the project uses @import "tailwindcss" syntax):
     - Define the color palette as CSS custom properties in @theme {} block
     - Use the semantic token naming convention already established
     - The new palette (green primary + amber accent) can replace or extend the
       existing pastel tokens

  b) Next.js 15 App Router:
     - Font import: add the Google Fonts Inter URL to the appropriate layout file
       (layout.tsx or a dedicated fonts CSS file)
     - Dark mode: the generator supports both light and dark — use next-themes
       or a custom class-based toggle on <html>

  c) React 18:
     - All interactive components (called-number chips, card cells, CTA buttons)
       get hover/focus transitions via Tailwind classes
     - Reduced-motion: wrap animation classes in a prefers-reduced-motion media
       query or use Tailwind's motion-reduce: prefix

  d) SVG icons:
     - Replace any emoji usage with Lucide React or Heroicons
     - Lucide is tree-shakeable and works well with React 18

  e) Recommendations for the coder (t_279a7e9b):
     1. Add Inter to the project (Google Fonts URL above)
     2. Decide on palette approach: full new palette vs. pastel-blend
     3. Define CSS variables for the new palette in globals.css @theme block
     4. Apply hover/focus transitions to all interactive components
     5. Audit emoji usage → replace with Lucide/Heroicons SVG
     6. Verify responsive breakpoints
     7. Add prefers-reduced-motion guard if any animations are introduced
     8. Ensure focus visible styles use --color-ring (#15803D)

─────────────────────────────────────────────────────────────────────────────────────────────
END OF REPORT
─────────────────────────────────────────────────────────────────────────────────────────────
