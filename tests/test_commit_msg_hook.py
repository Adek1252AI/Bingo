"""Tests for .githooks/commit-msg hook.

Uses unittest (stdlib) so no external dependencies required.
Run with: python3 tests/test_commit_msg_hook.py
"""

import os
import subprocess
import tempfile
import shutil
import unittest

HOOK_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    ".githooks", "commit-msg",
)
CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    ".githooks", "config.yaml",
)


def init_git_repo(tmpdir):
    """Create a minimal git repo with hooks installed."""
    subprocess.run(["git", "init"], cwd=tmpdir, check=True, capture_output=True)
    subprocess.run(
        ["git", "config", "user.email", "test@example.com"],
        cwd=tmpdir, check=True, capture_output=True,
    )
    subprocess.run(
        ["git", "config", "user.name", "Test User"],
        cwd=tmpdir, check=True, capture_output=True,
    )
    subprocess.run(
        ["git", "config", "core.hooksPath", ".githooks"],
        cwd=tmpdir, check=True, capture_output=True,
    )
    os.makedirs(os.path.join(tmpdir, ".githooks"), exist_ok=True)
    shutil.copy(HOOK_PATH, os.path.join(tmpdir, ".githooks", "commit-msg"))
    shutil.copy(CONFIG_PATH, os.path.join(tmpdir, ".githooks", "config.yaml"))
    os.chmod(os.path.join(tmpdir, ".githooks", "commit-msg"), 0o755)
    return tmpdir


def run_hook(repo_dir, commit_msg, branch=None):
    """Run the commit-msg hook. Returns (exit_code, output, final_msg_text)."""
    msg_file = os.path.join(repo_dir, "COMMIT_MSG_TMP")
    with open(msg_file, "w") as f:
        f.write(commit_msg)

    if branch:
        subprocess.run(
            ["git", "checkout", "-b", branch],
            cwd=repo_dir, check=True, capture_output=True,
        )

    result = subprocess.run(
        ["bash", os.path.join(repo_dir, ".githooks", "commit-msg"), msg_file],
        capture_output=True, text=True, cwd=repo_dir,
    )
    output = result.stdout + result.stderr

    with open(msg_file, "r") as f:
        final_msg = f.read()

    os.remove(msg_file)
    return result.returncode, output, final_msg


class TestConventionalCommits(unittest.TestCase):
    """Standard Conventional Commits validation."""

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()
        self.repo = init_git_repo(self.tmpdir)

    def tearDown(self):
        shutil.rmtree(self.tmpdir)

    def test_valid_feat_commit(self):
        code, output, msg = run_hook(self.repo, "feat: add new feature")
        self.assertEqual(code, 0, f"Expected success, got: {output}")

    def test_valid_fix_with_scope(self):
        code, output, msg = run_hook(self.repo, "fix(api): resolve null pointer")
        self.assertEqual(code, 0, f"Expected success, got: {output}")

    def test_valid_docs_commit(self):
        code, output, msg = run_hook(self.repo, "docs: update README")
        self.assertEqual(code, 0, f"Expected success, got: {output}")

    def test_invalid_commit_rejected(self):
        code, output, msg = run_hook(self.repo, "just some random message")
        self.assertNotEqual(code, 0, "Non-conventional commit should be rejected")
        self.assertIn("Conventional Commits", output)

    def test_empty_commit_rejected(self):
        code, output, msg = run_hook(self.repo, "")
        self.assertNotEqual(code, 0, "Empty commit message should be rejected")


class TestMergeCommitBypass(unittest.TestCase):
    """Merge commit messages must bypass Conventional Commits validation."""

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()
        self.repo = init_git_repo(self.tmpdir)

    def tearDown(self):
        shutil.rmtree(self.tmpdir)

    def test_merge_branch_message_accepted(self):
        code, output, msg = run_hook(
            self.repo,
            "Merge branch 'develop' into claude/implement-differentiation",
        )
        self.assertEqual(code, 0, f"Merge commit should pass, got: {output}")

    def test_merge_pull_request_accepted(self):
        code, output, msg = run_hook(
            self.repo,
            "Merge pull request #42 from user/feat-branch",
        )
        self.assertEqual(code, 0, f"PR merge commit should pass, got: {output}")

    def test_merge_no_trailers_added(self):
        code, output, msg = run_hook(
            self.repo,
            "Merge branch 'develop' into claude/implement-differentiation",
            branch="claude/test-merge",
        )
        self.assertEqual(code, 0)
        self.assertNotIn("Generated-By:", msg)
        self.assertNotIn("Co-authored-by:", msg)


class TestFixupSquashBypass(unittest.TestCase):
    """fixup! and squash! commits must bypass Conventional Commits validation."""

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()
        self.repo = init_git_repo(self.tmpdir)

    def tearDown(self):
        shutil.rmtree(self.tmpdir)

    def test_fixup_commit_accepted(self):
        code, output, msg = run_hook(self.repo, "fixup! feat: add feature")
        self.assertEqual(code, 0, f"Fixup commit should pass, got: {output}")

    def test_squash_commit_accepted(self):
        code, output, msg = run_hook(self.repo, "squash! fix: correct typo")
        self.assertEqual(code, 0, f"Squash commit should pass, got: {output}")

    def test_fixup_breaking_change_accepted(self):
        code, output, msg = run_hook(self.repo, "fixup! feat!: breaking change")
        self.assertEqual(code, 0, f"Fixup breaking change should pass, got: {output}")

    def test_fixup_no_trailers_added(self):
        code, output, msg = run_hook(
            self.repo, "fixup! feat: add feature",
            branch="claude/test-fixup",
        )
        self.assertEqual(code, 0)
        self.assertNotIn("Generated-By:", msg)
        self.assertNotIn("Co-authored-by:", msg)


class TestTrailerInjection(unittest.TestCase):
    """Auto-inject attribution trailers on agent branches."""

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()
        self.repo = init_git_repo(self.tmpdir)

    def tearDown(self):
        shutil.rmtree(self.tmpdir)

    def test_claude_branch_gets_trailers(self):
        code, output, msg = run_hook(
            self.repo, "feat: add rate limiting",
            branch="claude/trailer-test",
        )
        self.assertEqual(code, 0)
        self.assertIn("Generated-By:", msg)
        self.assertIn("Co-authored-by:", msg)
        self.assertIn("claude-code", msg)

    def test_human_branch_no_trailers(self):
        code, output, msg = run_hook(
            self.repo, "feat: add human feature",
            branch="feat/human-feature",
        )
        self.assertEqual(code, 0)
        self.assertNotIn("Generated-By:", msg)
        self.assertNotIn("Co-authored-by:", msg)

    def test_existing_trailers_not_duplicated(self):
        initial_msg = (
            "feat: add rate limiting\n"
            "\n"
            "Generated-By: claude-code/1.0 (model: test; operator: op@example.com)\n"
            "Co-authored-by: Claude Code <noreply@anthropic.com>\n"
        )
        code, output, msg = run_hook(
            self.repo, initial_msg,
            branch="claude/dup-test",
        )
        self.assertEqual(code, 0)
        self.assertEqual(msg.count("Generated-By:"), 1)
        self.assertEqual(msg.count("Co-authored-by:"), 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
