import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BoardGrid, { getTextSizeClass } from '@/interface/components/BoardGrid';

const SAMPLE_GRID = [
  ['apple', 'banana', 'cherry', 'date', 'elderberry'],
  ['fig', 'grape', 'kiwi', 'lemon', 'mango'],
  ['nectarine', 'orange', 'FREE', 'pear', 'quince'],
  ['raspberry', 'strawberry', 'tangerine', 'ugli', 'vanilla'],
  ['watermelon', 'xigua', 'yam', 'zucchini', 'avocado'],
];

describe('getTextSizeClass', () => {
  it('returns large class for 1-4 char labels', () => {
    expect(getTextSizeClass('Go')).toBe('text-base sm:text-lg');
    expect(getTextSizeClass('FREE')).toBe('text-base sm:text-lg');
    expect(getTextSizeClass('abcd')).toBe('text-base sm:text-lg');
  });

  it('returns medium class for 5-10 char labels', () => {
    expect(getTextSizeClass('hello')).toBe('text-xs sm:text-sm');
    expect(getTextSizeClass('cherry')).toBe('text-xs sm:text-sm');
    expect(getTextSizeClass('abcdefghij')).toBe('text-xs sm:text-sm');
  });

  it('returns small class for 11-20 char labels', () => {
    expect(getTextSizeClass('strawberryy')).toBe('text-[0.65rem] sm:text-xs');
    expect(getTextSizeClass('a'.repeat(11))).toBe('text-[0.65rem] sm:text-xs');
    expect(getTextSizeClass('a'.repeat(20))).toBe('text-[0.65rem] sm:text-xs');
  });

  it('returns extra-small class for 20+ char labels', () => {
    expect(getTextSizeClass('a'.repeat(21))).toBe('text-[0.55rem] sm:text-[0.65rem]');
    expect(getTextSizeClass('Submit Application Form')).toBe(
      'text-[0.55rem] sm:text-[0.65rem]'
    );
  });

  it('monotonically decreases class size as text gets longer', () => {
    const short = getTextSizeClass('Go');
    const medium = getTextSizeClass('cherry');
    const long = getTextSizeClass('strawberryy');
    const veryLong = getTextSizeClass('Submit Application Form');

    const scale = (cls: string) => {
      if (cls.includes('text-base')) return 3;
      if (cls.includes('text-sm')) return 2;
      if (cls.includes('text-xs')) return 1;
      if (cls.includes('0.55') || cls.includes('0.65')) return 0;
      return 0;
    };

    expect(scale(short)).toBeGreaterThan(scale(medium));
    expect(scale(medium)).toBeGreaterThan(scale(long));
    expect(scale(long)).toBeGreaterThan(scale(veryLong));
  });
});

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

  it('highlights called cells with dark background', () => {
    const called = ['apple', 'cherry', 'mango'];
    const { container } = render(<BoardGrid grid={SAMPLE_GRID} called={called} />);

    const gridContainer = container.querySelector('.grid-cols-5')!;
    const calledElements = gridContainer.querySelectorAll('.bg-neutral-900');
    // 3 called cells + 1 FREE cell = 4
    expect(calledElements.length).toBe(4);
  });

  it('displays the current number prominently with badge', () => {
    const current = 'cherry';
    render(<BoardGrid grid={SAMPLE_GRID} current={current} />);

    const badges = screen.getAllByText(current);
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('styles the free cell distinctly', () => {
    const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
    const freeCell = container.querySelector('.bg-neutral-900.text-white');
    expect(freeCell).toBeTruthy();
    expect(freeCell?.textContent).toBe('FREE');
  });

  it('renders all three cell states together', () => {
    const called = ['apple', 'banana'];
    const current = 'cherry';
    const { container } = render(
      <BoardGrid grid={SAMPLE_GRID} called={called} current={current} />
    );

    const gridContainer = container.querySelector('.grid-cols-5')!;

    // Called cells (dark) — should be 2 + 1 FREE cell = 3
    const calledElements = gridContainer.querySelectorAll('.bg-neutral-900');
    expect(calledElements.length).toBe(3);

    // Current cell (lighter dark) — should be exactly 1
    const currentElements = gridContainer.querySelectorAll('.bg-neutral-800');
    expect(currentElements.length).toBe(1);

    // Free cell (distinct dark)
    const freeCell = container.querySelector('.bg-neutral-900.text-white');
    expect(freeCell).toBeTruthy();
  });

  describe('staggered entrance', () => {
    it('marks each cell as a motion child with staggered animation order', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;
      const cells = gridContainer.querySelectorAll('[data-cell-index]');
      expect(cells.length).toBe(25);
      expect(cells[0]).toHaveAttribute('data-cell-index', '0');
      expect(cells[24]).toHaveAttribute('data-cell-index', '24');
    });

    it('re-triggers the entrance when a new board key is provided', () => {
      const { container, rerender } = render(
        <BoardGrid grid={SAMPLE_GRID} entranceKey="board-1" />
      );
      const grid1 = container.querySelector('.grid-cols-5')!;
      expect(grid1).toHaveAttribute('data-board-key', 'board-1');

      rerender(<BoardGrid grid={SAMPLE_GRID} entranceKey="board-2" />);
      const grid2 = container.querySelector('.grid-cols-5')!;
      expect(grid2).toHaveAttribute('data-board-key', 'board-2');
    });
  });

  describe('daub interaction', () => {
    it('calls onCellToggle when a cell is clicked', () => {
      const onCellToggle = vi.fn();
      render(
        <BoardGrid grid={SAMPLE_GRID} onCellToggle={onCellToggle} />
      );
      fireEvent.click(screen.getByText('apple'));
      expect(onCellToggle).toHaveBeenCalledWith('apple');
    });

    it('does not call onCellToggle for the free cell', () => {
      const onCellToggle = vi.fn();
      render(
        <BoardGrid grid={SAMPLE_GRID} onCellToggle={onCellToggle} />
      );
      fireEvent.click(screen.getByText('FREE'));
      expect(onCellToggle).not.toHaveBeenCalled();
    });

    it('exposes daubed cells as buttons for keyboard access', () => {
      const { container } = render(
        <BoardGrid grid={SAMPLE_GRID} onCellToggle={() => {}} />
      );
      const gridContainer = container.querySelector('.grid-cols-5')!;
      const buttons = gridContainer.querySelectorAll('button');
      expect(buttons.length).toBe(24);
    });
  });

  describe('grid cell sizing (uniform board)', () => {
    it('every cell button fills its grid cell (w-full aspect-square)', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;
      const buttons = gridContainer.querySelectorAll('button');
      expect(buttons.length).toBe(24);
      buttons.forEach((btn) => {
        expect(btn).toHaveClass('w-full');
        expect(btn).toHaveClass('aspect-square');
      });
    });

    it('centers the board within the page (mx-auto + max-width)', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;
      expect(gridContainer).toHaveClass('mx-auto');
      expect(gridContainer.className).toMatch(/max-w-\[/);
    });

    it('the FREE cell fills its grid cell too', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const freeCell = container.querySelector('.bg-neutral-900.text-white')!;
      expect(freeCell).toHaveClass('w-full');
      expect(freeCell).toHaveClass('aspect-square');
    });

    it('grid items cannot blow out their tracks (min-w-0)', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;
      const items = gridContainer.querySelectorAll('[data-cell-index]');
      expect(items.length).toBe(25);
      items.forEach((item) => {
        expect(item).toHaveClass('min-w-0');
      });
    });

    it('cell text wraps on word boundaries (no mid-word splits)', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;
      const spans = gridContainer.querySelectorAll('button span');
      expect(spans.length).toBe(24);
      spans.forEach((span) => {
        expect(span).toHaveClass('overflow-wrap-break-word');
        expect(span.getAttribute('style')).toContain('cqw');
      });
    });
  });

  describe('responsive text sizing', () => {
    it('uses container-query font sizing on all cells', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;

      const allButtons = gridContainer.querySelectorAll('button');
      expect(allButtons.length).toBe(24);

      // All cells use inline cqw-based font sizing with word-boundary wrapping
      allButtons.forEach((btn) => {
        const span = btn.querySelector('span');
        expect(span).toBeTruthy();
        expect(span?.getAttribute('style')).toContain('cqw');
        expect(span).toHaveClass('overflow-wrap-break-word');
      });
    });

    it('free cell also uses responsive text sizing', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const freeCell = container.querySelector('.bg-neutral-900.text-white')!;
      const span = freeCell.querySelector('span')!;
      expect(span).toBeTruthy();
      expect(span.getAttribute('style')).toContain('cqw');
    });
  });

  describe('win-line highlight', () => {
    it('adds the winning-cell class to cells on the completed line', () => {
      const { container } = render(
        <BoardGrid
          grid={SAMPLE_GRID}
          called={[]}
          winningCells={[[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]}
        />
      );
      const gridContainer = container.querySelector('.grid-cols-5')!;
      const winning = gridContainer.querySelectorAll('.winning-cell');
      expect(winning.length).toBe(5);
    });

    it('does not highlight cells when there is no win', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;
      expect(gridContainer.querySelectorAll('.winning-cell').length).toBe(0);
    });
  });
});
