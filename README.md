# Bingo

## What it is

A modern bingo game website — words instead of numbers. Players pick a topic (e.g. Star Wars), get a random 5×5 board with 24 themed words, and share a link so another player sees the same words in different cells.

## Status

Deployed to GitHub Pages at https://adek1252ai.github.io/Bingo/ (auto-deploys on push to `master`). Next.js 15 (app router, static export) + TypeScript strict. Clean Architecture folder structure in place. 10 movie word-pools bundled. Core use cases and infrastructure written. Minimal UI placeholder (topic picker → generate → board grid → share link).

## Repository

https://github.com/Adek1252AI/Bingo

## Deployment (GitHub Pages)

**Choice: `gh-pages` branch** (not `docs/` on `master`). Rationale: build artifacts never land on `master`, the build runs in CI (no "commit the dist" workflow), and `docs/` would require committing a fresh export on every change.

How it works:

1. Push to `master` triggers `.github/workflows/deploy.yml`.
2. The workflow runs `npm ci` + `npm run build` (static export → `out/`), adds a `.nojekyll` file (GitHub Pages' Jekyll would otherwise drop `_next/` — directories starting with `_`), and pushes `out/` to the `gh-pages` branch via `peaceiris/actions-gh-pages`.
3. GitHub Pages serves `gh-pages` at https://adek1252ai.github.io/Bingo/ (repo Settings → Pages → Source: "Deploy from a branch", branch `gh-pages`, directory `/ (root)` — set once).

Two config details that make the subpath work:

- `basePath: '/Bingo'` in `next.config.js` — the site is served under `/Bingo/`, so asset URLs must be `/Bingo/_next/...` (without this, the export references `/_next/...` which 404s on a project site). Any code that builds absolute URLs by hand must include the base path.
- `trailingSlash: true` makes the export emit `out/index.html`, which Pages serves at `/Bingo/`.

The workflow can also be triggered manually (workflow_dispatch).

## Architecture (for agents)

Clean Architecture with 4 layers. The key rule: **logic lives in `domain/` + `application/`, UI lives in `interface/`**. Use cases are pure TypeScript — testable without Next.js or a browser.

```
src/
  domain/
    entities/       — data shapes only: Topic, Board (interfaces)
    rules/          — pure validation functions: board-rules.ts
      (no framework deps, no side effects)
  application/
    useCases/       — business logic: GenerateRandomBoard, CreateShareLink, LoadSharedBoard
      (depend on infrastructure interfaces, not implementations)
    types/          — shared types across use cases
  infrastructure/
    wordPool/       — WordPoolRepository (interface) + StaticWordPoolRepository (reads bundled JSON)
    sharing/        — EncodingAdapter (JSON + base64url) + ArrangementEngine (seeded shuffle, 5×5 grid, free center [2][2])
    config/         — topics.ts (builds topic catalog from word-pools/index.ts)
  interface/
    app/            — Next.js app router: layout.tsx, page.tsx ('use client')
    components/     — React components: TopicPicker, BoardGrid, ShareLink
    lib/            — small utilities: utils.ts
  word-pools/       — one JSON file per topic + index.ts barrel (imported statically, no fs at runtime)
```

### How the layers connect

- `interface/app/page.tsx` creates infrastructure instances (repository, encoding, arrangement) and passes them into use cases. The page is a thin orchestration layer.
- Use cases depend only on infrastructure **interfaces** (e.g. `WordPoolRepository`), not concrete classes — so swapping in a custom/remote repository later requires changing one line in `page.tsx`.
- `domain/` and `application/` never import from `interface/` or `infrastructure/` — that's the dependency direction. `interface/` imports everything.

### Sharing mechanism (summary)

- A share link encodes `{ words, seed, topic }` as base64url(JSON) in a URL fragment.
- Two players open the same link → same `words` array, same `shareSeed`.
- Each player generates a random `playerSeed` per session → different cell arrangement per player, same word set.
- `ArrangementEngine.arrange(words, shareSeed, playerSeed)` → 5×5 grid with free cell at [2][2]. Determinism: seeded LCG + Fisher-Yates.

## Dev commands

```bash
npm install      # first time, or after pulling
npm run dev      # dev server at http://localhost:3000
npm run build    # static export → out/ directory
npm run start    # serve the static build (port 3000)
npm run lint     # run ESLint (not configured yet — run tsc --noEmit for type checks)
```

### Type checking

```bash
npx tsc --noEmit
```

TypeScript strict mode is on. No type errors should be introduced.

## How to add a new word pool

1. Create `src/word-pools/<slug>.json` (e.g. `src/word-pools/back-to-the-future.json`).
2. Format: `{ "name": "Back to the Future", "words": ["word1", "word2", ...] }`.
3. Add at least **24 unique words**. 30+ is fine — the use case picks 24 randomly.
4. Import it in `src/word-pools/index.ts` and add it to the `wordPools` object with a lowercase-keyed entry (the key is what the topic picker uses). This barrel file is the single source of truth the repository reads from at build time.
5. No other code changes needed — the repository discovers topics from `index.ts` at build time.

## Coding conventions

- **TypeScript strict** (`"strict": true` in tsconfig.json). No `any`, no `@ts-ignore` without comment.
- **One export per file** for entities and use cases. Barrel files (`index.ts`) only for re-exporting, not for arbitrary grouping.
- **Interfaces define contracts; classes implement them.** Infrastructure has interfaces (`WordPoolRepository`, `EncodingAdapter`, `ArrangementEngine`) and concrete classes (`StaticWordPoolRepository`, `JsonBase64EncodingAdapter`, `DeterministicArrangementEngine`).
- **React components:** filename matches component name (`TopicPicker.tsx` → `TopicPicker`). Default export.
- **Use client directive:** any component using `useState`, `useEffect`, browser APIs (`window`, `document`, `navigator`), or user interaction (`onClick`, `onChange`) must have `'use client'` at the top. Server components (none yet) have no directive.
- **No side effects in domain or application layers.** Those layers are pure functions / classes with injected dependencies only.
- **JSON data files** use kebab-case filenames (`star-wars.json`). Topic names (the `name` field inside JSON) can be any case — the repository matches case-insensitively.
- **No console.log in committed code.** Use during dev, remove before committing unless debugging a real issue.

## TypeScript strictness rationale

Strict mode catches null/undefined mistakes, unused variables, and implicit `any` — all common bugs in this kind of app where the domain model is small and correctness matters. The cost is a few extra type annotations; the benefit is fewer runtime errors in the board generation and sharing logic.

## Deferred features (not in this scaffold)

- Custom boards (user-provided words, localStorage)
- AI-generated topic word lists (user says a movie → AI generates → user adjusts)
- User-extendable topics (runtime mechanism for adding word lists)
