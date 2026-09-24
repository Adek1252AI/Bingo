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
    expect(getTextSizeClass('Go')).toBe('text-lg sm:text-xl md:text-2xl');
    expect(getTextSizeClass('FREE')).toBe('text-lg sm:text-xl md:text-2xl');
    expect(getTextSizeClass('abcd')).toBe('text-lg sm:text-xl md:text-2xl');
  });

  it('returns medium class for 5-10 char labels', () => {
    expect(getTextSizeClass('hello')).toBe('text-base sm:text-lg md:text-xl');
    expect(getTextSizeClass('cherry')).toBe('text-base sm:text-lg md:text-xl');
    expect(getTextSizeClass('abcdefghij')).toBe('text-base sm:text-lg md:text-xl');
  });

  it('returns small class for 11-20 char labels', () => {
    expect(getTextSizeClass('strawberryy')).toBe('text-sm sm:text-base md:text-lg');
    expect(getTextSizeClass('a'.repeat(11))).toBe('text-sm sm:text-base md:text-lg');
    expect(getTextSizeClass('a'.repeat(20))).toBe('text-sm sm:text-base md:text-lg');
  });

  it('returns extra-small class for 20+ char labels', () => {
    expect(getTextSizeClass('a'.repeat(21))).toBe('text-xs sm:text-sm md:text-base');
    expect(getTextSizeClass('Submit Application Form')).toBe(
      'text-xs sm:text-sm md:text-base'
    );
  });

  it('monotonically decreases class size as text gets longer', () => {
    // Pick strings in four distinct length buckets
    const short = getTextSizeClass('Go');              // 2 chars  → largest
    const medium = getTextSizeClass('cherry');          // 6 chars  → medium
    const long = getTextSizeClass('strawberryy');       // 11 chars → small
    const veryLong = getTextSizeClass('Submit Application Form'); // 25 chars → smallest

    // Order by Tailwind scale: 2xl > xl > lg > base > sm > xs
    const scale = (cls: string) => {
      if (cls.includes('text-2xl')) return 5;
      if (cls.includes('xl')) return 4;
      if (cls.includes('lg')) return 3;
      if (cls.includes('text-base')) return 2;
      if (cls.includes('text-sm')) return 1;
      if (cls.includes('text-xs')) return 0;
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

  describe('staggered entrance', () => {
    it('marks each cell as a motion child with staggered animation order', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;
      const cells = gridContainer.querySelectorAll('[data-cell-index]');
      // All 25 cells participate in the stagger
      expect(cells.length).toBe(25);
      // Cell order is encoded for the stagger delay
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
      // All non-free cells are buttons; free cell is not
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
      // Without w-full, an aspect-square flex button shrink-to-fits to its
      // text content — cells end up different sizes and misaligned.
      buttons.forEach((btn) => {
        expect(btn).toHaveClass('w-full');
        expect(btn).toHaveClass('aspect-square');
      });
    });

    it('centers the board within the page (mx-auto + max-width)', () => {
      // The board grid is narrower than the page container; mx-auto +
      // max-w keep it horizontally centered instead of hugging the left
      // edge (t_b193245e regression guard).
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;
      expect(gridContainer).toHaveClass('mx-auto');
      expect(gridContainer.className).toMatch(/max-w-\[/);
    });

    it('the FREE cell fills its grid cell too', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const freeCell = container.querySelector('.italic')!;
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
    it('cell text wraps instead of clipping (min-w-0 break-words)', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;
      const spans = gridContainer.querySelectorAll('button span');
      expect(spans.length).toBe(24);
      // Without min-w-0 the flex-child span cannot shrink below its text
      // width, so long words clip instead of wrapping.
      spans.forEach((span) => {
        expect(span).toHaveClass('min-w-0');
        expect(span).toHaveClass('break-words');
      });
    });
  });

  describe('responsive text sizing', () => {
    it('applies larger font class to shorter text and smaller class to longer text', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const gridContainer = container.querySelector('.grid-cols-5')!;

      const allButtons = gridContainer.querySelectorAll('button');
      const classesByText: Record<string, string[]> = {};
      allButtons.forEach((btn) => {
        const text = btn.textContent.trim();
        classesByText[text] = btn.className
          .split(' ')
          .filter((c) => /^text-(xs|sm|base|lg|xl|2xl)$/.test(c));
      });

      // 4-char labels → text-lg
      expect(classesByText['fig']).toContain('text-lg');
      expect(classesByText['kiwi']).toContain('text-lg');

      // 10-char labels → text-base
      expect(classesByText['elderberry']).toContain('text-base');
      expect(classesByText['watermelon']).toContain('text-base');
      expect(classesByText['strawberry']).toContain('text-base');

      // 9-char labels → text-base
      expect(classesByText['raspberry']).toContain('text-base');
      expect(classesByText['nectarine']).toContain('text-base');
      expect(classesByText['tangerine']).toContain('text-base');
    });

    it('free cell also uses responsive text sizing', () => {
      const { container } = render(<BoardGrid grid={SAMPLE_GRID} />);
      const freeCell = container.querySelector('.italic')!;
      // 'FREE' is 4 chars → text-lg tier
      expect(freeCell.className).toMatch(/text-lg/);
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
