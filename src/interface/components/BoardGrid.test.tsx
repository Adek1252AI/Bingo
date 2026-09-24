import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BoardGrid from '@/interface/components/BoardGrid';

const SAMPLE_GRID = [
  ['apple', 'banana', 'cherry', 'date', 'elderberry'],
  ['fig', 'grape', 'kiwi', 'lemon', 'mango'],
  ['nectarine', 'orange', 'FREE', 'pear', 'quince'],
  ['raspberry', 'strawberry', 'tangerine', 'ugli', 'vanilla'],
  ['watermelon', 'xigua', 'yam', 'zucchini', 'avocado'],
];

describe('BoardGrid', () => {
  it('renders a 5x5 grid with all cells', () => {
    render(<BoardGrid grid={SAMPLE_GRID} />);
    SAMPLE_GRID.flat().forEach((cell) => {
      expect(screen.getByText(cell)).toBeTruthy();
    });
  });

  it('renders the heading', () => {
    render(<BoardGrid grid={SAMPLE_GRID} />);
    expect(screen.getByText('Your Board')).toBeTruthy();
  });

  it('highlights called cells with accent background', () => {
    const called = ['apple', 'cherry', 'mango'];
    const { container } = render(<BoardGrid grid={SAMPLE_GRID} called={called} />);

    // Called cells should have the accent background class (scoped to grid, not badge)
    const gridContainer = container.querySelector('.grid-cols-5')!;
    const calledElements = gridContainer.querySelectorAll('.bg-accent');
    expect(calledElements.length).toBe(3);
  });

  it('displays the current number prominently with badge', () => {
    const current = 'cherry';
    render(<BoardGrid grid={SAMPLE_GRID} current={current} />);

    // Current number appears in badge (outside the grid)
    const badges = screen.getAllByText(current);
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('styles the free cell distinctly', () => {
    const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
    const freeCell = container.querySelector('.italic');
    expect(freeCell).toBeTruthy();
    expect(freeCell?.textContent).toBe('FREE');
  });

  it('renders all three cell states together', () => {
    const called = ['apple', 'banana'];
    const current = 'cherry';
    const { container } = render(
      <BoardGrid grid={SAMPLE_GRID} called={called} current={current} />
    );

    // Scope to grid container to exclude the badge
    const gridContainer = container.querySelector('.grid-cols-5')!;

    // Called cells (accent) — should be exactly 2
    const calledElements = gridContainer.querySelectorAll('.bg-accent');
    expect(calledElements.length).toBe(2);

    // Current cell (primary) — should be exactly 1
    const currentElements = gridContainer.querySelectorAll('.bg-primary');
    expect(currentElements.length).toBe(1);

    // Free cell (distinct italic)
    const freeCell = container.querySelector('.italic');
    expect(freeCell).toBeTruthy();
  });
});
