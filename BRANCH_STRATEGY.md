# Bingo - Branch Strategy

## Commit Prefix Convention

Agent commits are identified by the `AGENT_` prefix in the commit message.

```
AGENT_ <commit message>
```

The `.githooks/commit-msg` hook ensures this prefix is always present — if a commit message doesn't start with `AGENT_`, the hook prepends it automatically.

Run `./scripts/install-hooks.sh` after cloning to set up the hook.
