# Contributing to Bingo

## Setup

After cloning, run the hooks setup script:

```bash
./scripts/install-hooks.sh
```

## Commit Convention

Agent commits are identified by the `AGENT_` prefix. The `commit-msg` hook in `.githooks/` will automatically prepend `AGENT_` to any commit message that doesn't already have it.

Human contributors do not need to use this prefix — the hook only applies it when missing.

## Workflow

1. Create a branch for your work
2. Make changes and commit
3. Open a Pull Request
4. Address review feedback
5. A maintainer will merge once approved
