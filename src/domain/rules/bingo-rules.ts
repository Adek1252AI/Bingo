
/**
 * Win detection for a 5x5 word-bingo board.
 *
 * Pure domain logic — no framework or DOM dependencies. A line is a full
 * row, column, or diagonal whose five cells are all "marked". The free
 * center cell is always considered marked.
 */

/** A grid cell, addressed as [row, col] with 0-based indices. */
export type Cell = [number, number];

/** All 12 possible winning lines on a 5x5 board. */
const LINES: readonly Cell[][] = (() => {
  const lines: Cell[][] = [];

  // Rows
  for (let r = 0; r < 5; r++) {
    lines.push([
      [r, 0],
      [r, 1],
      [r, 2],
      [r, 3],
      [r, 4],
    ]);
  }

  // Columns
  for (let c = 0; c < 5; c++) {
    lines.push([
      [0, c],
      [1, c],
      [2, c],
      [3, c],
      [4, c],
    ]);
  }

  // Diagonals
  lines.push([
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
  ]);
  lines.push([
    [0, 4],
    [1, 3],
    [2, 2],
    [3, 1],
    [4, 0],
  ]);

  return lines;
})();

/**
 * Internal: returns every completed line (row, column, or diagonal whose
 * five cells are all marked, with the free cell always counting as marked).
 */
function findCompletedLines(
  grid: string[][],
  marked: Set<string>,
  freeCell: string
): Cell[][] {
  const complete: Cell[][] = [];
  for (const line of LINES) {
    const isComplete = line.every(([r, c]) => {
      const value = grid[r]?.[c];
      return value === freeCell || marked.has(value);
    });
    if (isComplete) complete.push(line);
  }
  return complete;
}

/**
 * Returns every cell that belongs to at least one completed line — the
 * "winning cells" to highlight. Returns an empty array when no line is
 * complete (no win).
 *
 * @param grid     5x5 grid of words; the free cell is identified by value.
 * @param marked   Words the player has marked (daubed) on their board.
 * @param freeCell Value of the free center cell, defaults to 'FREE'.
 */
export function checkBingo(
  grid: string[][],
  marked: string[],
  freeCell: string = 'FREE'
): Cell[] {
  const winning = new Set<string>();

  for (const line of findCompletedLines(grid, new Set(marked), freeCell)) {
    for (const cell of line) winning.add(`${cell[0]}-${cell[1]}`);
  }

  return [...winning].map((key) => {
    const [r, c] = key.split('-').map(Number);
    return [r, c] as Cell;
  });
}

/**
 * Returns how many lines are complete — used to announce the win
 * ("2 winning lines"). Returns 0 when there is no win.
 */
export function countBingoLines(
  grid: string[][],
  marked: string[],
  freeCell: string = 'FREE'
): number {
  return findCompletedLines(grid, new Set(marked), freeCell).length;
}
