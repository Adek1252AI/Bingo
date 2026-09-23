import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import LoadBoardForm from './LoadBoardForm';

describe('LoadBoardForm', () => {
  it('renders the paste input and Load button', () => {
    render(
      <LoadBoardForm value="" onChange={() => {}} onLoad={() => {}} />
    );
    expect(screen.getByPlaceholderText(/paste a share link/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  });

  it('calls onChange when typing in the input', () => {
    const onChange = vi.fn();
    render(
      <LoadBoardForm value="" onChange={onChange} onLoad={() => {}} />
    );
    fireEvent.change(screen.getByPlaceholderText(/paste a share link/i), {
      target: { value: 'https://example.com/#abc123' },
    });
    expect(onChange).toHaveBeenCalledWith('https://example.com/#abc123');
  });

  it('calls onLoad when the Load button is clicked', () => {
    const onLoad = vi.fn();
    render(
      <LoadBoardForm value="some-link" onChange={() => {}} onLoad={onLoad} />
    );
    fireEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(onLoad).toHaveBeenCalled();
  });

  it('calls onLoad when Enter is pressed in the input', () => {
    const onLoad = vi.fn();
    render(
      <LoadBoardForm value="some-link" onChange={() => {}} onLoad={onLoad} />
    );
    fireEvent.keyDown(screen.getByPlaceholderText(/paste a share link/i), {
      key: 'Enter',
    });
    expect(onLoad).toHaveBeenCalled();
  });
});
