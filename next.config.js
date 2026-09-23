
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // GitHub Pages project site: served at https://adek1252ai.github.io/Bingo/
  // Without basePath the export references /_next/... absolute paths, which
  // 404 under the /Bingo/ subpath. Keep in sync with the deploy workflow.
  basePath: '/Bingo',
};

module.exports = nextConfig;
