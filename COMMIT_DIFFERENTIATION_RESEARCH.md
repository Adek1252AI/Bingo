# Branch Strategy & Commit Differentiation — Research Summary

**Task:** t_c2bd7a56 — Research current branch strategy and commit differentiation approaches
**Date:** 2026-09-17
**Assignee:** researcher

---

## 1. Current State of the Bingo Repository

**Repo:** https://github.com/Adek1252AI/Bingo
**Workspace:** /home/adek/Projects/Hermes/Bingo

### Git topology
- Branches: `main`, `develop` (develop is currently checked out; both track origin)
- Commits: 1 total — `bfe631f Initial commit` on develop; `e7d7c0f Initial commit` on main
- Tags: none
- Remotes: origin → https://github.com/Adek1252AI/Bingo.git

### Existing conventions
- **`BRANCH_STRATEGY.md`** exists and defines:
  - `main` — production, protected, no direct pushes
  - `develop` — default working branch, feature branches merge here first
  - `feature/<name>` — short-lived feature/fix branches
  - PR-based workflow; at least one approving review to merge into develop; periodic develop→main merges
  - Merge rules table (main blocked, develop allowed, feature/* allowed)
- **NOT covered:** agent vs human differentiation, commit message conventions, git hooks, branch naming beyond the generic `feature/` prefix, attribution.
- **Absent:** CONTRIBUTING.md, AGENTS.md, CLAUDE.md, commitlint config, lefthook config, commit-msg hooks (only stock .sample files in .git/hooks), commit template, user/email overrides in git config.

### Bottom line
The repo is effectively greenfield for anything related to distinguishing human-authored vs agent/automated commits. The branch workflow exists but says nothing about agent commits; there are no enforced commit conventions and no hooks.

---

## 2. External Best Practices Observed

Sources consulted: conventionalbranch.org (Conventional Branch 1.1.0), ai-provenance-spec (jonathan-kellerai), gunbark.dev commit participant resolution, crashoverride.com "Attributing AI-Authored Commits in Git", aivshuman.dev classification pipeline, github-tools.com commit attribution guide, Conventional Commits 1.0.0 spec, Reddit/HN discussions on Conventional Commits.

### 2a. Branch-naming prefixes for agent work
- **Conventional Branch 1.1.0** defines a registry of AI-agent branch prefixes:
  - `ai/` — any AI agent (vendor-neutral)
  - `claude/` — Claude Code (Anthropic)
  - `codex/` — OpenAI Codex
  - `copilot/` — GitHub Copilot
  - `cursor/` — Cursor (Anysphere)
- Trunk branches (`main`, `master`, `develop`) use no prefix.
- Gives teams the ability to apply review policy by source, route CI differently (heavier security/license scan on agent branches), attribute activity/cost by prefix, and automate housekeeping (auto-label PRs, branch protection rules).

### 2b. Commit message conventions
- **Conventional Commits 1.0.0** is the most widely referenced standard: `<type>(<scope>): <subject>` with optional body and footer. Types include `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Used by many projects for automated changelog/semver generation (the primary "automation" benefit cited in practitioner discussions).
- Criticisms exist (ceremony, type/verb confusion, redundancy with issue keys), but the spec is widely adopted and tooling-friendly.

### 2c. Trailers for agent attribution
- **`Co-authored-by:`** — GitHub-recognized trailer; renders additional avatars on the commit page and counts toward contribution stats. Popularised by GitHub for pair programming and bot contributions.
- **Arbitrary trailers — `Generated-By:`, `Agent:`, `operator:`** — git-interpret-trailers supports any `Key: Value` footer line. The crashoverride guide recommends a pattern like:
  ```
  feat(api): add idempotency key validation
  ...
  Generated-By: claude-code/0.42 (model: claude-sonnet-4-5; operator: dev@example.com)
  Co-authored-by: Claude Code <noreply@anthropic.com>
  Signed-off-by: Alice Chen <alice@example.com>
  ```
- The gunbark.dev participant resolver canonicalises author + all `Co-authored-by` trailers through `.mailmap`, then filters against a bot-pattern regex to classify commits as human/bot/unknown.

### 2d. Author/committer identity + signoff gates
- Git has exactly two identity fields per commit (`author` and `committer`) plus an open-ended trailer block.
- Bot classification pipelines (aivshuman.dev) use a priority cascade: GitHub API bot flag → bot email patterns (dependabot, renovate, `[bot]@users.noreply.github.com`) → AI agent email domains → `Co-authored-by` trailers → commit message markers (`aider:`, "Generated with Claude Code", etc.).
- A `commit-msg` hook can enforce that any commit whose author email matches an "agent/bot" pattern MUST include an `operator:` or `Signed-off-by:` trailer identifying the human who initiated/supervised the change — the cheapest possible accountability gate.

---

## 3. Three Viable Approaches

### Approach 1 — Branch-naming prefixes (lightweight, visible, no tooling)

**Mechanism:** Give agent work its own branch prefix; keep human work on the existing type prefixes.

- Human branches: `feat/`, `fix/`, `docs/`, `chore/`, `test/` (extends the existing `feature/` convention in BRANCH_STRATEGY.md)
- Agent branches: `ai/<scope>` (vendor-neutral) or tool-specific `claude/<scope>`, `codex/<scope>`, `copilot/<scope>`, `cursor/<scope>`
- Optional policy: PRs from `ai/*`/`claude/*` require an extra human review or a heavier CI pass.

**Pros:**
- Zero tooling; immediately visible in `git branch`, PR list, CI trigger rules
- Plays well with existing CI/CD — prefix drives pipeline behavior (e.g., extra security scan on agent branches)
- Conventional Branch spec and ai-provenance-spec both codify this; there is a maintained registry of agent prefixes
- Easy to grep/attribute later: `git branch --list 'ai/*'`

**Cons:**
- Branch renaming is painful mid-flight; requires one-branch-one-change discipline
- Does NOT label individual commits — signal is lost if a human commits onto an agent branch or an agent commits onto a human branch
- Requires discipline from whoever creates the branch (human or agent)

**Best fit:** Teams wanting cheap, immediately visible separation in a PR-based workflow.

---

### Approach 2 — Commit message conventions + attribution trailers (durable, per-commit)

**Mechanism:** Adopt Conventional Commits as the baseline; add explicit trailers to mark agent-generated work. Enforce with a `commit-msg` hook and/or commitlint.

- Human commit: `feat(api): add idempotency key validation`
- Agent commit:
  ```
  feat(api): add idempotency key validation

  Validate Idempotency-Key header on all POST requests; reject
  duplicates within the 24h window using Redis SETNX.

  Generated-By: claude-code/1.0 (operator: dev@example.com)
  Co-authored-by: Claude Code <noreply@anthropic.com>
  ```
- The `Co-authored-by` trailer is natively rendered by GitHub.
- The `Generated-By` (or `Agent:` / `operator:`) trailer is an arbitrary git-interpretable trailer that downstream tools can parse.
- A `commit-msg` hook can require the trailer on any commit from an agent/bot email and can reject commits lacking an operator signoff on agent emails.

**Pros:**
- Attribution lives with the commit, not the branch — survives cherry-picks, rebases, squash merges
- Conventional Commits enable automated changelog/semver (the main automation benefit practitioners cite)
- GitHub renders `Co-authored-by` avatars natively
- Can be enforced incrementally — hook + CI — without changing the branch workflow

**Cons:**
- More ceremony per commit; agents/humans must remember the trailer
- Not all agents add `Co-authored-by` by default (Claude Code does in some configs, Copilot does, Cursor varies) — a hook or agent skill may be needed to add it
- Relying on email matching alone to detect "agent" commits is brittle (shared emails, noreply addresses)

**Best fit:** Teams wanting durable per-commit provenance and already leaning toward Conventional Commits.

---

### Approach 3 — Author/committer identity + pre-commit signoff gate (strongest audit trail)

**Mechanism:** Make agent commits carry a distinct author identity (bot email/name) and gate them with a required human `Signed-off-by` or `operator` trailer via a `commit-msg` or `pre-commit` hook.

- Configure agent runs to commit as a distinct identity (e.g. `Claude Code <noreply@anthropic.com>` or a project bot email) instead of reusing the human's identity.
- A `commit-msg` hook checks: if author email matches an "agent/bot" pattern, the message MUST contain an `operator: <human email>` trailer or a `Signed-off-by: <human>` line, else the commit is rejected.
- On GitHub, bot accounts are already flagged via the API `type: Bot` field; services like aivshuman.dev already classify commits using the cascade: GitHub bot flag → bot email patterns → `Co-authored-by` trailers → commit message markers.

**Pros:**
- Strongest accountability/audit trail — every agent commit is traceable to an operator
- The hook is the cheapest possible gate and can be project-local (no CI dependency for the check)
- Works even when branches get mixed; identification is per-commit

**Cons:**
- Requires configuring the agent tool's git identity (some tools make this easy, some don't)
- A bot email pattern list needs maintenance as new tools appear
- Can feel heavy for low-stakes automation (dependabot-style chores)
- GitHub API-based classification (aivshuman style) is a reporting tool, not a commit-time gate — useful for dashboards but not for enforcing policy at commit time

**Best fit:** Projects with compliance/audit needs, or teams that want an explicit "human must sign off on agent commits" policy enforced at commit time.

---

## 4. Recommended Graduated Path for Bingo

Given the repo is greenfield and BRANCH_STRATEGY.md already defines a PR workflow:

1. **Layer 1 (now, cheap):** Extend BRANCH_STRATEGY.md to add agent prefixes (`ai/*` vendor-neutral, plus tool-specific options) alongside human type prefixes. No hook needed; immediately visible.

2. **Layer 2 (soon, durable):** Add Conventional Commits as the commit format and a `commit-msg` hook that requires a `Generated-By:`/`Co-authored-by:` trailer on agent-authored commits. This gives per-commit signal that survives squash merges and branch mixing.

3. **Layer 3 (if/when audit matters):** Add the operator-signoff gate so no agent commit lands without a named human operator. Useful if the project adopts compliance requirements; optional otherwise.

This gives a graduated path: branch prefix now → trailers when Conventional Commits land → signoff gate if audit matters.

---

## 5. Suggested Next Artifacts (not yet written — owner's choice)

- **Updated `BRANCH_STRATEGY.md`** — add a "Agent vs human branch naming" section with the prefix table and any review/CI policy.
- **`AGENTS.md` / `CLAUDE.md`** snippet — encode the branch-naming and commit-message conventions for whichever agent tools the project uses.
- **`commit-msg` hook + commit template** — enforce Conventional Commits + agent trailers; optionally pair with commitlint/lefthook.
- **`.gitattributes` / `.mailmap`** — optional, for canonicalising author identities if multiple bots/humans share emails.

---

## Sources

- Conventional Branch 1.1.0 — https://conventionalbranch.org/
- Conventional Branch agent prefix registry — https://conventionalbranch.org/about
- ai-provenance-spec conventions — https://github.com/jonathan-kellerai/ai-provenance-spec/blob/main/docs/agents/conventions.md
- Attributing AI-Authored Commits in Git (crashoverride) — https://crashoverride.com/resources/knowledge-base/code-ownership/attributing-ai-commits-git
- Commit Attribution (github-tools) — https://github-tools.com/guide/commit-attribution
- AI vs Human commit classification — https://aivshuman.dev/docs
- Conventional Commits 1.0.0 — https://www.conventionalcommits.org/en/v1.0.0/
- gunbark.dev commit participant/bot-filter resolver — https://gunbark.dev/content/1bac5a61-c3ab-458f-b68c-19b14d75828f
- GitHub gist: branch naming best practices — https://gist.github.com/kmilodenisglez/a19ec3c98dd285c547c324c8b478e5e8
- Reddit/HN discussions on Conventional Commits trade-offs — various
