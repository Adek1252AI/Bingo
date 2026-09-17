#!/bin/bash
# install-hooks.sh — One-time setup for Bingo git hooks
#
# Configures git to use the project-local .githooks directory and makes
# all hooks executable. Run this once after cloning the repository.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT"

echo "Setting up Bingo git hooks..."
echo "  Repository: $REPO_ROOT"

# Configure git to use the project-local hooks directory
git config core.hooksPath .githooks
echo "  core.hooksPath -> .githooks"

# Make all hooks executable
chmod +x .githooks/*
echo "  Hooks made executable."

# Prompt for operator identity (used in attribution trailers)
CURRENT_NAME=$(git config user.name 2>/dev/null || true)
CURRENT_EMAIL=$(git config user.email 2>/dev/null || true)

if [ -z "$CURRENT_NAME" ] || [ -z "$CURRENT_EMAIL" ]; then
  echo ""
  echo "Your git user identity is not fully configured."
  read -rp "Your name: " OP_NAME
  read -rp "Your email: " OP_EMAIL
  git config user.name "$OP_NAME"
  git config user.email "$OP_EMAIL"
  echo "  Git identity set to: $OP_NAME <$OP_EMAIL>"
else
  echo "  Git identity: $CURRENT_NAME <$CURRENT_EMAIL>"
fi

# Update .githooks/config.yaml with operator info if empty
CONFIG=".githooks/config.yaml"
if [ -f "$CONFIG" ]; then
  if grep -q 'email: ""' "$CONFIG" 2>/dev/null; then
    # Replace empty email and name
    sed -i "s/^  name: \"\"/  name: \"$(git config user.name)\"/" "$CONFIG"
    sed -i "s/^  email: \"\"/  email: \"$(git config user.email)\"/" "$CONFIG"
    echo "  Updated .githooks/config.yaml with operator identity."
  fi
fi

# Verify PyYAML is available (needed for the commit-msg hook)
if python3 -c "import yaml" 2>/dev/null; then
  echo "  PyYAML detected (required for commit-msg hook)."
else
  echo "  WARNING: PyYAML not found. Install with: pip install pyyaml"
  echo "  The commit-msg hook requires PyYAML to read config.yaml."
fi

echo ""
echo "Setup complete! Git hooks are now active."
echo ""
echo "Quick reference:"
echo "  Human branches: feat/*, fix/*, docs/*, chore/*, test/*, refactor/*"
echo "  Agent branches: ai/*, claude/*, codex/*, copilot/*, cursor/*"
echo ""
echo "Commit messages must follow Conventional Commits format:"
echo "  <type>(<scope>): <subject>"
echo "  Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
