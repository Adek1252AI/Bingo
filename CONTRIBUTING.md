# Contributing to Bingo

Welcome! This document explains how to get started with contributing to the Bingo repository.

## Prerequisites

- Git
- Python 3 (for git hooks)
- [PyYAML](https://pyyaml.org/) (`pip install pyyaml`)

## Initial Setup

After cloning the repository, run the hooks setup script once:

```bash
./scripts/install-hooks.sh
```

This will:
1. Configure git to use the project-local `.githooks` directory
2. Make all hooks executable
3. Prompt for your identity if not already configured
4. Verify that PyYAML is available

## Branch Naming

### Human Contributors

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/<name>` | New feature | `feat/user-auth` |
| `fix/<name>` | Bug fix | `fix/login-redirect` |
| `docs/<name>` | Documentation | `docs/api-reference` |
| `chore/<name>` | Maintenance | `chore/update-deps` |
| `test/<name>` | Test additions | `test/integration-api` |
| `refactor/<name>` | Code refactoring | `refactor/extract-service` |

### AI Agent Contributors

| Prefix | Tool | Example |
|--------|------|---------|
| `ai/<name>` | Any agent (generic) | `ai/add-rate-limiting` |
| `claude/<name>` | Claude Code | `claude/refactor-db-layer` |
| `codex/<name>` | OpenAI Codex | `codex/add-cli-tool` |
| `copilot/<name>` | GitHub Copilot | `copilot/fix-typings` |
| `cursor/<name>` | Cursor | `cursor/add-tests` |

## Commit Message Format

All commits must follow the [Conventional Commits](https://www convencionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<trailers>
```

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Example (Human)

```
feat(auth): add JWT token refresh

Implement sliding-window refresh for expired tokens.
New endpoint: POST /auth/refresh
```

### Example (Agent)

```
feat(api): add rate limiting middleware

Token-bucket algorithm with Redis backing.
Default: 100 req/min per API key.

Generated-By: claude-code/1.0 (model: claude-sonnet-4-5; operator: adek1252ai@gmail.com)
Co-authored-by: Claude Code <noreply@anthropic.com>
```

On agent branches, the `commit-msg` hook automatically appends attribution trailers. You do not need to add them manually.

## Workflow

1. Create a branch from `develop` using the appropriate prefix.
2. Make your changes and commit following the Conventional Commits format.
3. Open a Pull Request into `develop`.
4. Address review feedback.
5. A project maintainer will merge once approved.

## Branch Protection

- `main` — Production, protected. Requires PR review + owner approval.
- `develop` — Integration branch. PR review recommended.
- All branches — No direct pushes to `main`.
