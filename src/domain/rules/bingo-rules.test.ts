import { describe, it, expect } from 'vitest';
import { checkBingo, countBingoLines } from './bingo-rules';

// 5x5 grid with a FREE center, matching ArrangementEngine output.
const GRID = [
  ['a', 'b', 'c', 'd', 'e'],
  ['f', 'g', 'h', 'i', 'j'],
  ['k', 'l', 'FREE', 'n', 'o'],
  ['p', 'q', 'r', 's', 't'],
  ['u', 'v', 'w', 'x', 'y'],
];

const cells = (win: [number, number][]) =>
  win.map(([r, c]) => `${r}-${c}`).sort().join(',');

describe('checkBingo', () => {
  it('returns no cells when nothing is marked', () => {
    expect(checkBingo(GRID, [])).toEqual([]);
  });

  it('returns no cells when fewer than 4 words are marked', () => {
    // A diagonal or the middle row/col needs only 4 words + FREE; anything
    // less can never complete a line.
    expect(checkBingo(GRID, ['a', 'b', 'c', 'd'])).toEqual([]);
  });

  it('detects a completed top row', () => {
    const win = checkBingo(GRID, ['a', 'b', 'c', 'd', 'e']);
    expect(cells(win)).toBe('0-0,0-1,0-2,0-3,0-4');
  });

  it('detects a completed middle row using the FREE cell (4 words)', () => {
    const win = checkBingo(GRID, ['k', 'l', 'n', 'o']);
    expect(cells(win)).toBe('2-0,2-1,2-2,2-3,2-4');
  });

  it('detects a completed column', () => {
    const win = checkBingo(GRID, ['b', 'g', 'l', 'q', 'v']);
    expect(cells(win)).toBe('0-1,1-1,2-1,3-1,4-1');
  });

  it('detects a completed middle column using the FREE cell', () => {
    const win = checkBingo(GRID, ['c', 'h', 'r', 'w']);
    expect(cells(win)).toBe('0-2,1-2,2-2,3-2,4-2');
  });

  it('detects the main diagonal (top-left to bottom-right) using FREE', () => {
    const win = checkBingo(GRID, ['a', 'g', 's', 'y']);
    expect(cells(win)).toBe('0-0,1-1,2-2,3-3,4-4');
  });

  it('detects the anti-diagonal (top-right to bottom-left) using FREE', () => {
    const win = checkBingo(GRID, ['e', 'i', 'q', 'u']);
    expect(cells(win)).toBe('0-4,1-3,2-2,3-1,4-0');
  });

  it('returns the union of cells when multiple lines complete at once', () => {
    // Middle row + middle column + both diagonals all pass through FREE.
    // Marking the cross + diagonal words completes 5 lines simultaneously.
    const win = checkBingo(GRID, [
      'k', 'l', 'n', 'o', // middle row
      'c', 'h', 'r', 'w', // middle column
      'a', 'g', 's', 'y', // main diagonal
    ]);
    // Union of middle row, middle column, and main diagonal cells.
    const expected = new Set([
      '2-0', '2-1', '2-2', '2-3', '2-4', // row
      '0-2', '1-2', '3-2', '4-2', // column (2-2 shared)
      '0-0', '1-1', '3-3', '4-4', // diagonal (2-2 shared)
    ]);
    expect(win.length).toBe(expected.size);
    expect(new Set(win.map(([r, c]) => `${r}-${c}`))).toEqual(expected);
  });

  it('ignores marked words that are not on the grid', () => {
    expect(checkBingo(GRID, ['zzz', 'nope', 'a', 'b', 'c'])).toEqual([]);
  });

  it('does not treat the FREE cell alone as a win', () => {
    // FREE is always "marked", but a line needs all five cells.
    expect(checkBingo(GRID, [])).toEqual([]);
  });

  it('supports a custom free-cell label', () => {
    const grid = [
      ['a', 'b', 'c', 'd', 'e'],
      ['f', 'g', 'h', 'i', 'j'],
      ['k', 'l', 'JOKER', 'n', 'o'],
      ['p', 'q', 'r', 's', 't'],
      ['u', 'v', 'w', 'x', 'y'],
    ];
    const win = checkBingo(grid, ['k', 'l', 'n', 'o'], 'JOKER');
    expect(cells(win)).toBe('2-0,2-1,2-2,2-3,2-4');
  });

  it('does not win when a line is missing exactly one word', () => {
    expect(checkBingo(GRID, ['a', 'b', 'c', 'd', 'f'])).toEqual([]);
  });
});

describe('countBingoLines', () => {
  it('counts zero lines when nothing is marked', () => {
    expect(countBingoLines(GRID, [])).toBe(0);
  });

  it('counts one line for a single completed row', () => {
    expect(countBingoLines(GRID, ['a', 'b', 'c', 'd', 'e'])).toBe(1);
  });

  it('counts multiple simultaneous lines', () => {
    // Middle row + middle column: both share the FREE cell.
    const count = countBingoLines(GRID, [
      'k', 'l', 'n', 'o', // middle row
      'c', 'h', 'r', 'w', // middle column
    ]);
    expect(count).toBe(2);
  });
});
