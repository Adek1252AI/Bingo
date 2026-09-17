# Bingo

## Branch Strategy & Merge Process

### Branch Structure

- **`main`** — Production-ready code only. Protected; no direct pushes or merges.
- **`develop`** — Default working branch. All feature branches merge here first.
- **Human branches** — Short-lived branches for individual work (see §Human Branch Prefixes below).
- **Agent branches** — Branches for AI tool contributions (see §Agent Branch Prefixes below).

### Branch Prefixes

#### Human Branch Prefixes

| Prefix            | Purpose       | Example                      |
|-------------------|---------------|------------------------------|
| `feat/<name>`     | New feature   | `feat/user-auth`             |
| `fix/<name>`      | Bug fix       | `fix/login-redirect`         |
| `docs/<name>`     | Documentation | `docs/api-reference`         |
| `chore/<name>`    | Maintenance   | `chore/update-deps`          |
| `test/<name>`     | Tests         | `test/integration-api`       |
| `refactor/<name>` | Refactoring   | `refactor/extract-service`   |

Existing `feature/*` branches are grandfathered in and do not need to be renamed.

#### Agent Branch Prefixes

| Prefix          | Tool            | Example                      |
|-----------------|-----------------|------------------------------|
| `ai/<name>`     | Any AI agent    | `ai/add-rate-limiting`       |
| `claude/<name>` | Claude Code     | `claude/refactor-db-layer`   |
| `codex/<name>`  | OpenAI Codex    | `codex/add-cli-tool`         |
| `copilot/<name>`| GitHub Copilot  | `copilot/fix-typings`        |
| `cursor/<name>` | Cursor          | `cursor/add-tests`           |

Use `ai/*` when the tool is unknown or mixed. Tool-specific prefixes are optional but provide per-tool attribution at the branch level.

### Commit Message Format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) v1.0.0:

```
<type>(<scope>): <subject>

<body>

<trailers>
```

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

The `<scope>` is optional but encouraged (e.g., module or component name).

#### Attribution Trailers (Agent Branches)

On agent branches, the `commit-msg` git hook automatically appends:

```
Generated-By: <tool>/<version> (model: <model-id>; operator: <human-email>)
Co-authored-by: <agent-name> <agent-email>
```

Do not manually add or modify these trailers — the hook handles them.

### Workflow

1. Create a branch from `develop` using the appropriate prefix for your work.
2. Make changes and commit following the Conventional Commits format.
3. Open a Pull Request from the branch into `develop`.
4. At least one approving review is required to merge into `develop`.
5. Periodically, `develop` is merged into `main` via a Pull Request.

### Git Hooks Setup

Run the setup script once after cloning:

```bash
./scripts/install-hooks.sh
```

This configures git to use `.githooks/` as the hooks directory and installs the `commit-msg` hook, which:
- Validates Conventional Commits format on every commit.
- Auto-injects attribution trailers on agent branches.

Requires Python 3 with PyYAML (`pip install pyyaml`).

### Merge Rules

| Target Branch     | Direct Push | Merge Requirements           |
|-------------------|-------------|------------------------------|
| `main`            | Blocked     | PR review + owner approval   |
| `develop`         | Allowed     | PR review recommended        |
| All branches      | Allowed     | Standard review process      |

### Branch Protection Summary

- **`main`**: PR reviews required, stale reviews dismissed, last-push approval enforced, admins included in restrictions, code owner approval required.
- **`develop`**: No strict protection rules; team follows PR-based workflow by convention.

### Migration Notes

- Existing `feature/*` branches can be renamed or left alone.
- Existing commits do not need to be rewritten.
- New commits follow the new format; old commits are grandfathered in.
