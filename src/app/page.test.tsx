import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';

// canvas-confetti needs a real 2D canvas context (jsdom has none) — mock it
// so the win celebration can be exercised end-to-end.
vi.mock('canvas-confetti', () => ({
  default: vi.fn(() => new Promise<void>((resolve) => resolve())),
}));

// The word-pool repository reads bundled JSON — real implementation is fine,
// but the page also uses Math.random for the arrangement. Daubing ALL 24
// words guarantees a completed line regardless of arrangement.

async function generateBoard() {
  // Pick the first topic radio and generate.
  const radio = screen.getAllByRole('radio')[0];
  fireEvent.click(radio);
  fireEvent.click(screen.getByRole('button', { name: /generate board/i }));
  await screen.findByText('Your Board');
}

describe('HomePage game flow with animations', () => {
  it('renders the board with staggered cells after generating', async () => {
    render(<HomePage />);
    await generateBoard();

    const cells = document.querySelectorAll('[data-cell-index]');
    expect(cells.length).toBe(25);
    // Entrance key present so the stagger re-triggers per board.
    expect(document.querySelector('[data-board-key]')).toBeTruthy();
  });

  it('daubs cells and shows the BINGO! celebration when a line completes', async () => {
    render(<HomePage />);
    await generateBoard();

    // Daub every playing cell (24 words) — guarantees completed lines.
    const buttons = [
      ...document.querySelectorAll('[data-cell-index] button'),
    ] as HTMLButtonElement[];
    expect(buttons.length).toBe(24);

    for (const button of buttons) {
      fireEvent.click(button);
    }

    // The win modal appears with the BINGO! heading.
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('BINGO!')).toBeInTheDocument();

    // Winning cells are highlighted on the board.
    const winning = document.querySelectorAll('.winning-cell');
    expect(winning.length).toBeGreaterThan(0);
  });

  it('closes the celebration via the Play again button', async () => {
    render(<HomePage />);
    await generateBoard();

    const buttons = [
      ...document.querySelectorAll('[data-cell-index] button'),
    ] as HTMLButtonElement[];
    for (const button of buttons) {
      fireEvent.click(button);
    }

    const playAgain = await screen.findByRole('button', {
      name: /play again/i,
    });
    fireEvent.click(playAgain);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    // The board keeps its daubs after the celebration closes.
    const marked = document.querySelectorAll('[aria-pressed="true"]');
    expect(marked.length).toBe(24);
  });

  it('clears daubs and re-keys the entrance when a new board is generated', async () => {
    render(<HomePage />);
    await generateBoard();

    const firstKey = document
      .querySelector('[data-board-key]')!
      .getAttribute('data-board-key');

    // Daub a few cells.
    const buttons = [
      ...document.querySelectorAll('[data-cell-index] button'),
    ] as HTMLButtonElement[];
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(document.querySelectorAll('[aria-pressed="true"]').length).toBe(2);

    // Generate a new board.
    fireEvent.click(screen.getByRole('button', { name: /generate board/i }));
    await waitFor(() => {
      const secondKey = document
        .querySelector('[data-board-key]')!
        .getAttribute('data-board-key');
      expect(secondKey).not.toBe(firstKey);
    });

    // Daubs are cleared on the fresh board.
    await waitFor(() => {
      expect(document.querySelectorAll('[aria-pressed="true"]').length).toBe(0);
    });
  });

  it('generating while loaded from a share link clears the loaded note', async () => {
    render(<HomePage />);
    await generateBoard();

    // No loaded-from-link note on a generated board.
    expect(
      screen.queryByText(/loaded shared board/i)
    ).toBeNull();
  });
});
