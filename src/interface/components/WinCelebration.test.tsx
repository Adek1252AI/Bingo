import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import confetti from 'canvas-confetti';
import WinCelebration from './WinCelebration';

// canvas-confetti needs a real 2D canvas context (jsdom has none), so mock
// the whole module. The mock lives inside the factory because vi.mock is
// hoisted above every const declaration.
vi.mock('canvas-confetti', () => ({
  default: vi.fn(() => new Promise<void>((resolve) => resolve())),
}));

const confettiMock = vi.mocked(confetti);

describe('WinCelebration', () => {
  beforeEach(() => {
    confettiMock.mockClear();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<WinCelebration open={false} onClose={() => {}} />);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(screen.queryByText('BINGO!')).toBeNull();
  });

  it('shows the BINGO! modal when open', () => {
    render(<WinCelebration open={true} onClose={() => {}} />);
    expect(screen.getByText('BINGO!')).toBeInTheDocument();
  });

  it('fires confetti exactly once when the celebration opens', () => {
    const { rerender } = render(<WinCelebration open={false} onClose={() => {}} />);
    expect(confettiMock).not.toHaveBeenCalled();

    rerender(<WinCelebration open={true} onClose={() => {}} />);
    expect(confettiMock).toHaveBeenCalledTimes(1);

    // Re-renders while open must not re-fire the burst.
    rerender(<WinCelebration open={true} onClose={() => {}} />);
    expect(confettiMock).toHaveBeenCalledTimes(1);
  });

  it('fires confetti again when re-opened after closing', () => {
    const { rerender } = render(<WinCelebration open={true} onClose={() => {}} />);
    rerender(<WinCelebration open={false} onClose={() => {}} />);
    rerender(<WinCelebration open={true} onClose={() => {}} />);
    expect(confettiMock).toHaveBeenCalledTimes(2);
  });

  it('passes reduced-motion protection to confetti', () => {
    render(<WinCelebration open={true} onClose={() => {}} />);
    expect(confettiMock).toHaveBeenCalledWith(
      expect.objectContaining({ disableForReducedMotion: true })
    );
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<WinCelebration open={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /play again|close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the winning line count when provided', () => {
    render(<WinCelebration open={true} onClose={() => {}} lines={2} />);
    expect(screen.getByText(/2 winning lines/i)).toBeInTheDocument();
  });

  it('renders as a dialog for assistive tech', () => {
    render(<WinCelebration open={true} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
