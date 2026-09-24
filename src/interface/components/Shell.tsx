
'use client';

import { ReactNode } from 'react';
import ThemeToggle from '@/interface/components/ThemeToggle';

interface ShellProps {
  children: ReactNode;
}

/**
 * Optional lobby/dashboard shell: a sticky glassmorphic header with the
 * gradient wordmark + theme toggle, and a bento grid for the content.
 *
 * The "use shell" flag lets callers opt in. When false, the page renders
 * without the shell (original compact single-column layout).
 */
export default function Shell({ children }: ShellProps) {
  return (
    <>
      <header className="glass-header">
        <div className="glass-header__inner">
          <a
            href="/"
            className="glass-header__wordmark wordmark-gradient"
            aria-label="Bingo home"
          >
            Bingo
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="bento-grid">{children}</main>
    </>
  );
}
