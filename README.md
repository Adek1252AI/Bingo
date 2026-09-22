# Bingo

A modern bingo game website — words instead of numbers.

## Core features

- **Random board generation** — pick a topic (e.g. Star Wars) and get a random bingo board with relevant words.
- **Custom board creation** — build your own board, choosing your own words.
- **Shareable links** — a link lets two (or more) players share the same board: same words, but the words appear in different cells for each player.

## Status

Scaffolding / pre-flight. The Obsidian project track is set up; the codebase has not been started yet.

## Tech stack (planned)

- Next.js + TypeScript
- Clean Architecture (domain / application / infrastructure / interface layers)
- Hosted on Vercel (free tier)
- Word pools as JSON files bundled with the app
- Shareable links via URL-encoded seed (no server)
- Custom boards via localStorage (no cross-device persistence for v1)

See the full analysis: [Research/Kanban-Obsidian-Pattern-B.md](../Research_General/Kanban-Obsidian-Pattern-B.md) in the Obsidian vault.

## Repository

https://github.com/Adek1252AI/Bingo
