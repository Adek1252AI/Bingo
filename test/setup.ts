import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically unmount and clean up after each test to prevent
// "Cannot re-render the same component twice" warnings from React 18.
afterEach(() => {
  cleanup();
});

// --- Browser API mocks ---

// navigator.clipboard is not available in jsdom; provide a minimal mock.
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: () => Promise.resolve(),
  },
  writable: true,
  configurable: true,
});

// --- Next.js router mock ---
// Components that use next/navigation hooks (useRouter, usePathname, etc.)
// will get a functional mock by default. Tests can override with vi.mock().

// --- window.location mock ---
// jsdom provides window.location but it's read-only. Provide a helper
// to set the URL for tests that depend on location.hash.
export const setWindowLocation = (url: string) => {
  // @ts-expect-error - jsdom allows this in test env
  delete window.location;
  // @ts-expect-error - jsdom allows this in test env
  window.location = new URL(url);
};
