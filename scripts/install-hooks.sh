#!/bin/sh
# Install git hooks for the Bingo repository.

cp .githooks/commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg

echo "Git hooks installed."
