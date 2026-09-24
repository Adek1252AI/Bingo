import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnimatedButton from './AnimatedButton';

describe('AnimatedButton', () => {
  it('renders a button with its children', () => {
    render(<AnimatedButton>Generate Board</AnimatedButton>);
    expect(
      screen.getByRole('button', { name: 'Generate Board' })
    ).toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    render(<AnimatedButton onClick={onClick}>Go</AnimatedButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <AnimatedButton onClick={onClick} disabled>
        Go
      </AnimatedButton>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('passes through style, className, and aria attributes', () => {
    render(
      <AnimatedButton
        style={{ background: '#0066cc' }}
        className="extra-class"
        aria-label="Copy"
      >
        Copy
      </AnimatedButton>
    );
    const button = screen.getByRole('button', { name: 'Copy' });
    expect(button).toHaveStyle({ background: 'rgb(0, 102, 204)' });
    expect(button.className).toContain('extra-class');
  });

  it('defaults to type="button" to avoid implicit form submits', () => {
    render(<AnimatedButton>Go</AnimatedButton>);
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute(
      'type',
      'button'
    );
  });

  it('respects an explicit type override', () => {
    render(<AnimatedButton type="submit">Go</AnimatedButton>);
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute(
      'type',
      'submit'
    );
  });
});
