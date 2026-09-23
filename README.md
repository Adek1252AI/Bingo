# Bingo

A modern bingo game website — words instead of numbers.

## Core features

- **Random board generation** — pick a topic (e.g. Star Wars) and get a random bingo board with relevant words.
- **Custom board creation** — build your own board, choosing your own words.
- **Shareable links** — a link lets two (or more) players share the same board: same words, but the words appear in different cells for each player.

## Status

Initial codebase scaffold created. Clean Architecture structure in place, 10 movie word pools, core use cases and infrastructure written. UI is a minimal placeholder. Not yet deployed.

## Architecture

```
src/
  domain/          — entities (Topic, Board) + validation rules
  application/     — use cases (GenerateRandomBoard, CreateShareLink, LoadSharedBoard)
  infrastructure/  — word pool repository, encoding adapter, arrangement engine
  interface/       — Next.js app router + React components
  word-pools/      — JSON files, one per movie topic (~30 words each)
```

## Tech stack

- Next.js 14 (app router, static export)
- TypeScript (strict)
- React 18
- Hosted on Vercel (static export, no custom backend)
- Word pools as JSON files bundled with the app
- Shareable links via base64url-encoded payload + deterministic seeded shuffle
- Custom boards deferred (localStorage, later)
- AI-generated topic word lists deferred

## Deferred features

- Custom boards (user-provided words, localStorage)
- AI-generated topic word lists (user says a movie → AI generates → user adjusts)
- User-extendable topics (runtime mechanism for adding word lists)

## Repository

https://github.com/Adek1252AI/Bingo
