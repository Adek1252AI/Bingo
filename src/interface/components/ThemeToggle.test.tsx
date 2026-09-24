import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset to light mode
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  it('renders a button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows the moon icon when in light mode (clicking switches to dark)', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    // aria-label starts with "Switch to dark" — exact string is "Switch to dark mode"
    expect(button.getAttribute('aria-label')).toMatch(/switch to dark/i);
  });

  it('shows the sun icon when in dark mode (clicking switches to light)', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toMatch(/switch to light/i);
  });

  it('toggles from dark to light on click', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggles from light to dark on click', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists the theme choice in localStorage', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(localStorage.getItem('bingo-theme')).toBe('dark');
  });

  it('survives localStorage being unavailable (no throw)', () => {
    const originalSetItem = localStorage.setItem;
    const throwingSetItem = () => { throw new Error('quota'); };
    Object.defineProperty(localStorage, 'setItem', {
      value: throwingSetItem,
      writable: true,
      configurable: true,
    });

    try {
      document.documentElement.setAttribute('data-theme', 'light');
      render(<ThemeToggle />);
      const button = screen.getByRole('button');

      // Should not throw — theme still toggles for this session
      expect(() => fireEvent.click(button)).not.toThrow();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    } finally {
      Object.defineProperty(localStorage, 'setItem', {
        value: originalSetItem,
        writable: true,
        configurable: true,
      });
    }
  });
});
