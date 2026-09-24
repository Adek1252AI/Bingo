import { render, screen } from '@testing-library/react';
import BoardGrid from './BoardGrid';

describe('BoardGrid', () => {
  const sampleGrid = [
    ['word-one', 'word-two', 'word-three', 'word-four', 'word-five'],
    ['short', 'medium-word', 'very-long-word-here', 'tiny', 'another-word'],
    ['a', 'b', 'FREE', 'c', 'd'],
    ['alpha', 'beta', 'gamma', 'delta', 'epsilon'],
    ['1', '2', '3', '4', '5'],
  ];

  // Helper: get all cell divs (they are labeled by role or can be found via container)
  const getCells = () => {
    // Cells are the leaf divs with border styling; find them via the container
    const container = screen.getByText('Your Board').nextElementSibling!;
    // In jsdom display:contents is not supported, so we get 5 rows,
    // each containing 5 cells. Flatten to all cells.
    const rows = container.children;
    const cells: Element[] = [];
    for (const row of Array.from(rows)) {
      for (const cell of Array.from(row.children)) {
        cells.push(cell);
      }
    }
    return cells;
  };

  it('renders the grid with all 25 cells', () => {
    render(<BoardGrid grid={sampleGrid} />);
    expect(getCells().length).toBe(25);
  });

  it('renders the FREE cell distinctly', () => {
    render(<BoardGrid grid={sampleGrid} />);
    const freeCell = screen.getByText('FREE');
    expect(freeCell).toBeInTheDocument();
    expect(freeCell).toHaveStyle({ fontStyle: 'italic' });
  });

  it('applies uniform aspect ratio to all cells', () => {
    render(<BoardGrid grid={sampleGrid} />);
    const cells = getCells();
    for (const cell of cells) {
      expect(cell).toHaveStyle({ aspectRatio: '1 / 1' });
    }
  });

  it('renders cells with width 100% so they fill their grid track', () => {
    render(<BoardGrid grid={sampleGrid} />);
    const cells = getCells();
    for (const cell of cells) {
      expect(cell).toHaveStyle({ width: '100%' });
    }
  });

  it('renders long text without breaking the grid', () => {
    const longGrid = [
      ['supercalifragilistic-expialidocious', 'short', 'medium', 'tiny', 'a'],
      ['word', 'word', 'word', 'word', 'word'],
      ['word', 'word', 'FREE', 'word', 'word'],
      ['word', 'word', 'word', 'word', 'word'],
      ['word', 'word', 'word', 'word', 'word'],
    ];
    render(<BoardGrid grid={longGrid} />);
    const cells = getCells();
    expect(cells.length).toBe(25);
    for (const cell of cells) {
      expect(cell).toHaveStyle({ overflow: 'hidden' });
    }
  });

  it('all cells use border-box sizing so padding does not expand dimensions', () => {
    render(<BoardGrid grid={sampleGrid} />);
    const cells = getCells();
    for (const cell of cells) {
      expect(cell).toHaveStyle({ boxSizing: 'border-box' });
    }
  });

  it('all cells have text-overflow ellipsis to handle long content', () => {
    render(<BoardGrid grid={sampleGrid} />);
    const cells = getCells();
    for (const cell of cells) {
      expect(cell).toHaveStyle({ textOverflow: 'ellipsis' });
    }
  });

  it('all cells have white-space nowrap to prevent wrapping', () => {
    render(<BoardGrid grid={sampleGrid} />);
    const cells = getCells();
    for (const cell of cells) {
      expect(cell).toHaveStyle({ whiteSpace: 'nowrap' });
    }
  });

  it('grid has 5 equal columns', () => {
    render(<BoardGrid grid={sampleGrid} />);
    const gridContainer = screen.getByText('Your Board').nextElementSibling!;
    expect(gridContainer).toHaveStyle({ gridTemplateColumns: 'repeat(5, 1fr)' });
  });
});
