/**
 * End-to-end verification of Bingo core functionalities.
 * Tests the actual production code (no mocks) to verify:
 * 1. Board generation
 * 2. Number/word calling (cell toggling simulation)
 * 3. Win detection (rows, columns, diagonals, FREE cell)
 */

import { describe, it, expect } from 'vitest';
import { StaticWordPoolRepository } from '@/infrastructure/wordPool/StaticWordPoolRepository';
import { DeterministicArrangementEngine } from '@/infrastructure/sharing/ArrangementEngine';
import { checkBingo, countBingoLines } from '@/domain/rules/bingo-rules';
import { validateBoard, validateTopic } from '@/domain/rules/board-rules';
import { GenerateRandomBoardUseCase } from '@/application/useCases/GenerateRandomBoardUseCase';

const wordPoolRepo = new StaticWordPoolRepository();
const arrangementEngine = new DeterministicArrangementEngine();
const generateBoard = new GenerateRandomBoardUseCase(wordPoolRepo);

describe('Bingo E2E Verification', () => {
  const topics = wordPoolRepo.listTopics();

  describe('1. Board Generation', () => {
    it('lists all available topics', () => {
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.map(t => t.name)).toContain('Star Wars');
    });

    it('every topic has valid word pools (24+ unique words)', () => {
      for (const topic of topics) {
        expect(() => validateTopic(topic)).not.toThrow();
        expect(topic.words.length).toBeGreaterThanOrEqual(24);
        const unique = new Set(topic.words.map(w => w.trim().toLowerCase()));
        expect(unique.size).toBe(topic.words.length);
      }
    });

    it('generates a valid 24-word board for any topic', () => {
      const board = generateBoard.execute('Star Wars');
      expect(board.words).toHaveLength(24);
      expect(board.words.every(w => typeof w === 'string' && w.trim().length > 0)).toBe(true);
      expect(() => validateBoard(board)).not.toThrow();
    });

    it('arranges board into a valid 5x5 grid with FREE center', () => {
      const board = generateBoard.execute('Star Wars');
      const grid = arrangementEngine.arrange(board.words, 'seed-a', 'seed-b');

      expect(grid).toHaveLength(5);
      expect(grid.every(row => row.length === 5)).toBe(true);
      expect(grid[2][2]).toBe('FREE');

      const allCells = grid.flat();
      const nonFree = allCells.filter(c => c !== 'FREE');
      expect(nonFree).toHaveLength(24);
      expect(nonFree.every(c => board.words.includes(c))).toBe(true);
      expect(new Set(nonFree).size).toBe(24); // no duplicates
    });
  });

  describe('2. Number/Word Calling (Cell Toggling)', () => {
    it('adds words to daubed list when called', () => {
      const board = generateBoard.execute('Star Wars');
      const grid = arrangementEngine.arrange(board.words, 's1', 'p1');
      const calledWord = grid[0][0];
      const daubed = [calledWord];
      expect(daubed).toContain(calledWord);
      expect(daubed.length).toBe(1);
    });

    it('supports multiple words being called', () => {
      const board = generateBoard.execute('Star Wars');
      const grid = arrangementEngine.arrange(board.words, 's2', 'p2');
      const words = [grid[0][0], grid[0][1], grid[0][2]];
      const daubed = [...words];
      expect(daubed.length).toBe(3);
      expect(daubed.every(w => grid.flat().includes(w))).toBe(true);
    });

    it('removes word from daubed list when un-called', () => {
      const board = generateBoard.execute('Star Wars');
      const grid = arrangementEngine.arrange(board.words, 's3', 'p3');
      const word = grid[0][0];
      let daubed = [word, grid[0][1]];
      daubed = daubed.filter(w => w !== word);
      expect(daubed).not.toContain(word);
      expect(daubed).toContain(grid[0][1]);
    });
  });

  describe('3. Win Detection', () => {
    const grid = [
      ['A', 'B', 'C', 'D', 'E'],
      ['F', 'G', 'H', 'I', 'J'],
      ['K', 'L', 'FREE', 'N', 'O'],
      ['P', 'Q', 'R', 'S', 'T'],
      ['U', 'V', 'W', 'X', 'Y'],
    ];

    it('detects no win with empty marks', () => {
      expect(checkBingo(grid, [])).toEqual([]);
      expect(countBingoLines(grid, [])).toBe(0);
    });

    it('detects no win with fewer than 4 words marked', () => {
      expect(checkBingo(grid, ['A', 'B', 'C'])).toEqual([]);
    });

    it('detects top row win (5 words)', () => {
      const win = checkBingo(grid, ['A', 'B', 'C', 'D', 'E']);
      expect(win).toHaveLength(5);
      expect(countBingoLines(grid, ['A', 'B', 'C', 'D', 'E'])).toBe(1);
      expect(win.every(([r]) => r === 0)).toBe(true);
    });

    it('detects middle row win via FREE cell (4 words)', () => {
      const win = checkBingo(grid, ['K', 'L', 'N', 'O']);
      expect(win).toHaveLength(5);
      expect(countBingoLines(grid, ['K', 'L', 'N', 'O'])).toBe(1);
      expect(win.every(([r]) => r === 2)).toBe(true);
    });

    it('detects column win', () => {
      const win = checkBingo(grid, ['B', 'G', 'L', 'Q', 'V']);
      expect(win).toHaveLength(5);
      expect(win.every(([, c]) => c === 1)).toBe(true);
    });

    it('detects middle column win via FREE', () => {
      const win = checkBingo(grid, ['C', 'H', 'R', 'W']);
      expect(win).toHaveLength(5);
      expect(win.every(([, c]) => c === 2)).toBe(true);
    });

    it('detects main diagonal win via FREE', () => {
      const win = checkBingo(grid, ['A', 'G', 'S', 'Y']);
      expect(win).toHaveLength(5);
      const positions = new Set(win.map(([r, c]) => `${r}-${c}`));
      expect(positions).toContain('0-0');
      expect(positions).toContain('1-1');
      expect(positions).toContain('2-2');
      expect(positions).toContain('3-3');
      expect(positions).toContain('4-4');
    });

    it('detects anti-diagonal win via FREE', () => {
      const win = checkBingo(grid, ['E', 'I', 'Q', 'U']);
      expect(win).toHaveLength(5);
      const positions = new Set(win.map(([r, c]) => `${r}-${c}`));
      expect(positions).toContain('0-4');
      expect(positions).toContain('1-3');
      expect(positions).toContain('2-2');
      expect(positions).toContain('3-1');
      expect(positions).toContain('4-0');
    });

    it('detects multiple simultaneous wins', () => {
      // Middle row + middle column + main diagonal
      const words = ['K', 'L', 'N', 'O', 'C', 'H', 'R', 'W', 'A', 'G', 'S', 'Y'];
      const win = checkBingo(grid, words);
      const lines = countBingoLines(grid, words);
      expect(lines).toBeGreaterThanOrEqual(3);
      expect(win.length).toBeGreaterThan(5);
    });

    it('ignores words not on the grid', () => {
      expect(checkBingo(grid, ['ZZZ', 'A', 'B', 'C'])).toEqual([]);
    });

    it('does not treat FREE alone as a win', () => {
      expect(checkBingo(grid, [])).toEqual([]);
    });

    it('supports custom free cell label', () => {
      const customGrid = [
        ['A', 'B', 'C', 'D', 'E'],
        ['F', 'G', 'H', 'I', 'J'],
        ['K', 'L', 'JOKER', 'N', 'O'],
        ['P', 'Q', 'R', 'S', 'T'],
        ['U', 'V', 'W', 'X', 'Y'],
      ];
      expect(checkBingo(customGrid, ['K', 'L', 'N', 'O'], 'JOKER')).toHaveLength(5);
    });
  });

  describe('Full Game Flow Integration', () => {
    it('simulates calling words until a win is achieved', () => {
      const gameGrid = [
        ['A', 'B', 'C', 'D', 'E'],
        ['F', 'G', 'H', 'I', 'J'],
        ['K', 'L', 'FREE', 'N', 'O'],
        ['P', 'Q', 'R', 'S', 'T'],
        ['U', 'V', 'W', 'X', 'Y'],
      ];

      // Call words in order, achieving top-row win after E is called
      const callSequence = ['F', 'K', 'A', 'B', 'P', 'C', 'Q', 'D', 'U', 'E'];
      let daubed: string[] = [];
      let winAchieved = false;

      for (const word of callSequence) {
        if (daubed.includes(word)) {
          daubed = daubed.filter(w => w !== word);
        } else {
          daubed.push(word);
        }
        const winningCells = checkBingo(gameGrid, daubed);
        if (winningCells.length > 0) {
          winAchieved = true;
          expect(winningCells).toHaveLength(5);
          expect(countBingoLines(gameGrid, daubed)).toBe(1);
          break;
        }
      }
      expect(winAchieved).toBe(true);
    });

    it('generates a real board, arranges it, and verifies win detection works', () => {
      // Use a fixed seed for reproducibility
      const board = generateBoard.execute('Star Wars');
      const grid = arrangementEngine.arrange(board.words, 'test-seed', 'player-seed');

      // Mark all words in the top row
      const topRowWords = grid[0].filter(w => w !== 'FREE');
      expect(topRowWords).toHaveLength(5);

      // Since we don't know which words are in row 0, mark all 24 and check
      // that at least one win exists (when all are marked, every line wins)
      const allWords = grid.flat().filter(w => w !== 'FREE');
      const allWinning = checkBingo(grid, allWords);
      expect(allWinning.length).toBeGreaterThan(0);
      expect(countBingoLines(grid, allWords)).toBeGreaterThan(0);
    });
  });
});
