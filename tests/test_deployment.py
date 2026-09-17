"""
Deployment verification tests for GitHub Pages.
Verifies the site is live at https://adek1252ai.github.io/Bingo/.

Uses unittest (stdlib) so no external dependencies required.
Run with: python3 tests/test_deployment.py
"""

import re
import unittest
import urllib.request

BASE_URL = "https://adek1252ai.github.io/Bingo"
PAGES = ["/", "/got_bingo.html"]


def _fetch(url):
    """Fetch a URL and return (status_code, text)."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.status, resp.read().decode("utf-8")


class TestGitHubPagesDeployment(unittest.TestCase):
    """Verify the Bingo site is live on GitHub Pages."""

    def test_pages_return_200(self):
        for page in PAGES:
            with self.subTest(page=page):
                status, _ = _fetch(BASE_URL + page)
                self.assertEqual(status, 200, f"{page} returned {status}")

    def test_got_bingo_html_is_valid(self):
        status, content = _fetch(BASE_URL + "/got_bingo.html")
        self.assertEqual(status, 200)
        self.assertIn("<!DOCTYPE html>", content)
        self.assertTrue(
            "Game of Thrones Bingo" in content or "GoT Bingo" in content,
            "Expected GoT Bingo title not found",
        )

    def test_css_linked_in_root(self):
        _, content = _fetch(BASE_URL + "/")
        self.assertIn("<link", content, "No CSS <link> found on root page")
        self.assertTrue(
            "assets/css" in content or "style.css" in content,
            "No CSS stylesheet reference found",
        )

    def test_root_references_got_bingo(self):
        _, content = _fetch(BASE_URL + "/")
        self.assertTrue(
            "got_bingo.html" in content or "Bingo" in content,
            "Root page does not reference the bingo page",
        )

    def test_bingo_grid_present(self):
        _, content = _fetch(BASE_URL + "/got_bingo.html")
        self.assertIn("bingo-grid", content, "bingo-grid container not found")
        cell_creation = len(re.findall(r"bingo-cell|createElement.*cell", content))
        self.assertGreaterEqual(
            cell_creation, 1, "No bingo cell generation logic found"
        )

    def test_js_and_css_embedded_in_bingo(self):
        _, content = _fetch(BASE_URL + "/got_bingo.html")
        self.assertIn("<style>", content, "No embedded <style> found")
        self.assertIn("<script>", content, "No embedded <script> found")


if __name__ == "__main__":
    unittest.main()
