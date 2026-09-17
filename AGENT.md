# Bingo - Agent Guidelines

## Commit Convention

When making commits as an AI agent, prefix the commit message with `AGENT_`.

Example:
```
AGENT_ simplify commit differentiation strategy
```

The `commit-msg` hook in `.githooks/` automatically prepends the prefix if it's missing.
