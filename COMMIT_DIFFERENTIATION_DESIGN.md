# Commit Differentiation Strategy — Design Spec

**Task:** t_65b1980b
**Date:** 2026-09-17
**Author:** coordinator (orchestrator)
**Status:** Approved for implementation

---

## 1. Decision & Rationale

**Chosen approach:** Layer 1 (branch prefixes) + Layer 2 (Conventional Commits + attribution trailers + `commit-msg` hook) implemented together as the baseline. Layer 3 (operator signoff gate) is deferred — revisit only if audit/compliance requirements emerge.

**Why this combination:**

- **Branch prefixes** give immediate, zero-tooling visibility in `git branch`, PR lists, and CI trigger rules. They cost nothing and are easy to enforce by convention.
- **Commit trailers** give durable per-commit provenance that survives squash merges, cherry-picks, and branch mixing. The branch prefix alone loses signal when branches get merged or commits are moved.
- **Conventional Commits** provide the structural hook for the trailers and unlock automated changelog/semver later. Adopting the format now avoids retrofitting it under time pressure.
- **The signoff gate (Layer 3)** is intentionally deferred because Bingo is greenfield with no compliance requirements yet. It adds friction for low-stakes automation (dependency updates, formatting) that isn't justified today.

**Why not just one layer:** Branch prefixes alone lose signal at merge time; trailers alone require discipline to add manually. Together, the prefix is the "quick scan" signal and the trailer is the "audit trail" signal. The `commit-msg` hook bridges them by auto-adding trailers based on the branch prefix, removing the discipline problem.

---

## 2. Branch Naming Conventions

### 2.1 Extending the existing `BRANCH_STRATEGY.md`

The current convention is `feature/<name>`. We extend it with type prefixes (human work) and agent prefixes:

| Prefix              | Used By        | Example                        |
|---------------------|----------------|--------------------------------|
| `feat/<name>`       | Human          | `feat/user-auth`               |
| `fix/<name>`        | Human          | `fix/login-redirect`           |
| `docs/<name>`       | Human          | `docs/api-reference`           |
| `chore/<name>`      | Human          | `chore/update-deps`            |
| `test/<name>`       | Human          | `test/integration-api`         |
| `refactor/<name>`   | Human          | `refactor/extract-service`     |
| `ai/<name>`         | Any AI agent   | `ai/add-rate-limiting`         |
| `claude/<name>`     | Claude Code    | `claude/refactor-db-layer`     |
| `codex/<name>`      | OpenAI Codex   | `codex/add-cli-tool`           |
| `copilot/<name>`    | GitHub Copilot | `copilot/fix-typings`          |
| `cursor/<name>`      | Cursor         | `cursor/add-tests`             |

### 2.2 Branch policy

- `ai/*` — vendor-neutral prefix for any agent; use when the tool is unknown or mixed.
- Tool-specific prefixes (`claude/*`, `codex/*`, etc.) — optional, for teams that want per-tool attribution at the branch level.
- All agent branches follow the same PR workflow: branch → PR → review → merge into `develop`.
- **No direct pushes** to `main` or `develop` from agents (same rule as humans).
- PRs from agent branches require at least one human review (same as `feature/*`).

### 2.3 Trunk branches (unchanged)

- `main` — production, protected.
- `develop` — default working branch, integration point.

---

## 3. Commit Message Format

### 3.1 Format (Conventional Commits 1.0.0)

```
<type>(<scope>): <subject>

<body>

<trailers>
```

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Scope** is optional but encouraged (e.g., module or component name).

### 3.2 Human commits (minimal change from today)

```
feat(auth): add JWT token refresh

Implement sliding-window refresh for expired tokens.
New endpoint: POST /auth/refresh
```

No required trailers. Conventional Commits format is the baseline.

### 3.3 Agent commits (with attribution trailers)

```
feat(api): add rate limiting middleware

Token-bucket algorithm with Redis backing.
Default: 100 req/min per API key.

Generated-By: claude-code/1.0 (model: claude-sonnet-4-5; operator: adek1252ai@gmail.com)
Co-authored-by: Claude Code <noreply@anthropic.com>
```

**Trailers explained:**

| Trailer          | Purpose                                                  | Required? |
|------------------|----------------------------------------------------------|-----------|
| `Generated-By:`  | Identifies the agent tool, model, and operating human    | Yes (agent) |
| `Co-authored-by:`| GitHub-native; renders avatar, counts as contribution   | Yes (agent) |

The `Generated-By` format is:
```
Generated-By: <tool>/<version> (model: <model-id>; operator: <human-email>)
```

### 3.4 Trailer auto-generation

The `commit-msg` hook auto-detects the branch prefix and injects trailers:

- On `ai/*`, `claude/*`, `codex/*`, `copilot/*`, `cursor/*` branches → hook appends `Generated-By:` and `Co-authored-by:` trailers if not already present.
- On `feat/*`, `fix/*`, `docs/*`, etc. → no trailers added.
- If the author email matches a known bot pattern (configured list), trailers are required regardless of branch prefix.

---

## 4. Git Hooks & Automation

### 4.1 `commit-msg` hook (enforcement point)

**Location:** `.githooks/commit-msg` (project-local, not the global git hooks path).

**Responsibilities:**

1. **Validate Conventional Commits format** — reject commits that don't match `^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+`
2. **Auto-inject attribution trailers** on agent branches:
   - Detect branch prefix from `git symbolic-ref --short HEAD`
   - If agent prefix and `Generated-By:` trailer missing, append it using the configured agent identity
   - If agent prefix and `Co-authored-by:` trailer missing, append it
3. **Reject mixed signals** — if the branch is an agent prefix but author is a human email (and vice versa), warn but don't block (could be a human fixing up an agent branch).

### 4.2 Hook installation

Since `.git/hooks` is not tracked in the repo, provide a setup script:

```bash
# scripts/install-hooks.sh
git config core.hooksPath .githooks
chmod +x .githooks/*
```

This is a one-time setup step per clone. Add it to `CONTRIBUTING.md`.

### 4.3 Configuration file

**Location:** `.githooks/config.yaml`

```yaml
# Agent identities used for trailer generation
agents:
  claude-code:
    name: "Claude Code"
    email: "noreply@anthropic.com"
    version: "1.0"
  codex:
    name: "OpenAI Codex"
    email: "noreply@openai.com"
    version: "1.0"
  copilot:
    name: "GitHub Copilot"
    email: "noreply@github.com"
    version: "1.0"
  cursor:
    name: "Cursor"
    email: "noreply@anysphere.com"
    version: "1.0"

# Bot email patterns (for detection even without branch prefix)
bot_patterns:
  - "noreply@anthropic.com"
  - "noreply@openai.com"
  - "[bot]@users.noreply.github.com"
  - "noreply@github.com"
  - "noreply@anysphere.com"

# Human operator (filled during setup)
operator:
  name: ""
  email: ""
```

The setup script prompts for operator name/email and writes them to this config.

### 4.4 CI integration (optional, future)

- Add a CI check that validates commit format on PRs (defense in depth if the local hook isn't installed).
- Use `commitlint` with `@commitlint/config-conventional` for the validation step.
- Not required for the initial implementation — the local hook suffices.

---

## 5. Integration with Existing Workflows

### 5.1 Branch strategy document

Update `BRANCH_STRATEGY.md` to add:
- Section on agent vs. human branch prefixes (from §2 above).
- Section on commit message format (from §3 above).
- Section on hook installation (from §4.2 above).

### 5.2 Agent configuration files

Create `CLAUDE.md` (or `AGENTS.md`) with instructions for Claude Code:

```markdown
## Commit conventions for this repo

- Branch prefix: `claude/<name>` or `ai/<name>`
- Commit format: Conventional Commits
- The `commit-msg` hook auto-injects `Generated-By` and `Co-authored-by` trailers
- Do not manually add or modify attribution trailers
```

Similar files for other tools as needed.

### 5.3 PR workflow (unchanged)

- Same PR workflow for agent and human branches.
- No additional review requirements for agent branches today.
- Branch protection on `main` stays the same.
- Agent branches are not subject to different merge rules.

### 5.4 Migration plan for existing work

- Existing `feature/*` branches can be renamed or left alone (existing convention is a subset of the new one).
- The single existing commit does not need to be rewritten.
- New commits follow the new format; old commits are grandfathered in.

---

## 6. Implementation Checklist (for coder task t_859738f7)

The following are concrete deliverables the coder should produce:

- [ ] **Update `BRANCH_STRATEGY.md`** — add sections from §5.1
- [ ] **Create `.githooks/commit-msg`** — the hook script (shell script)
- [ ] **Create `.githooks/config.yaml`** — agent identities and bot patterns
- [ ] **Create `scripts/install-hooks.sh`** — one-time setup script
- [ ] **Create `CLAUDE.md`** — agent instructions for Claude Code
- [ ] **Add `CONTRIBUTING.md`** (or section) — mention hook setup for new developers
- [ ] **Test the hook** — verify on an agent branch that trailers are auto-added
- [ ] **Verify rejection path** — confirm the hook rejects non-conventional commits
- [ ] **Push all changes to `develop`** via a PR on an agent branch (`claude/implement-differentiation`)

---

## 7. Deferred / Future

**Layer 3 — Operator signoff gate:** If compliance or audit requirements emerge, add a rule to the `commit-msg` hook that rejects any agent commit without a `Signed-off-by: <human>` trailer. This is a config toggle (`require_signoff: true` in `.githooks/config.yaml`), not a redesign.

**CI-based enforcement:** Add `commitlint` to CI as defense-in-depth. Not needed for the initial rollout.

**Per-tool CI routing:** Branch prefix could trigger different CI behavior (e.g., heavier security scan on `ai/*`). This is a CI config change, not a hook change.

---

## 8. Summary of Changes

| File                          | Action   | Purpose                                    |
|-------------------------------|----------|--------------------------------------------|
| `BRANCH_STRATEGY.md`          | Edit     | Add agent prefixes, commit format, hooks   |
| `.githooks/commit-msg`        | Create   | Validate format, auto-add trailers         |
| `.githooks/config.yaml`       | Create   | Agent identities, bot patterns, operator   |
| `scripts/install-hooks.sh`    | Create   | One-time hook setup for new clones         |
| `CLAUDE.md`                   | Create   | Agent instructions                         |
| `CONTRIBUTING.md`             | Create   | Developer setup guide                      |

Total: 6 files. Minimal disruption to existing workflow. The only behavioral change for humans is that commit messages must follow Conventional Commits format (low cost, high future value).
