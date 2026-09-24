'use client';

import { ReactNode } from 'react';
import ThemeToggle from '@/interface/components/ThemeToggle';

interface ShellProps {
  children: ReactNode;
}

/**
 * Top shell with the logo, bold header, and bento grid content.
 */
export default function Shell({ children }: ShellProps) {
  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <div className="sphere-motif" aria-hidden="true" />
          <a href="/" className="site-header__brand" aria-label="Bingo home">
            <img
              src="/Bingo/logo.png"
              alt=""
              className="site-header__logo"
              width="36"
              height="36"
            />
            <span className="site-header__wordmark">Bingo</span>
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="bento-grid">{children}</main>
    </>
  );
}
