# Agent Instructions — Bingo Repository

## Commit Conventions

This repository uses a **commit differentiation strategy** to distinguish between human and AI contributions. When contributing to this repo, follow these conventions:

### Branch Prefix

For agent work, use one of these prefixes:
- `claude/<name>` — Claude Code contributions
- `codex/<name>` — OpenAI Codex contributions
- `copilot/<name>` — GitHub Copilot contributions
- `cursor/<name>` — Cursor contributions
- `ai/<name>` — Generic AI agent contributions

Example: `claude/add-rate-limiting`

### Commit Format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) v1.0.0:

```
<type>(<scope>): <subject>

<body>

<trailers>
```

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Attribution Trailers (Agent Branches)

On agent branches, the `commit-msg` git hook **automatically appends** attribution trailers:

```
Generated-By: <tool>/<version> (model: <model-id>; operator: <human-email>)
Co-authored-by: <agent-name> <agent-email>
```

**Do not manually add or modify these trailers** — the hook handles them.

### Git Hooks Setup

Run the setup script once after cloning:

```bash
./scripts/install-hooks.sh
```

This configures git to use `.githooks/` as the hooks directory and makes the hooks executable.

Requires Python 3 with PyYAML (`pip install pyyaml`).

### Workflow

1. Create a branch from `develop` using the appropriate agent prefix.
2. Make changes and commit following the Conventional Commits format.
3. Open a Pull Request from the branch into `develop`.
4. At least one approving review is required to merge into `develop`.

### Quick Reference

| Branch Type | Prefix         | Example                  |
|-------------|----------------|--------------------------|
| Human       | `feat/<name>`  | `feat/user-auth`         |
| Human       | `fix/<name>`   | `fix/login-redirect`     |
| Agent       | `claude/<name>`| `claude/refactor-db`     |
| Agent       | `ai/<name>`    | `ai/add-tests`           |
