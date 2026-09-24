import { render, screen } from '@testing-library/react';
import Shell from './Shell';

describe('Shell', () => {
  it('renders the Bingo wordmark', () => {
    render(
      <Shell>
        <p>Child content</p>
      </Shell>
    );
    expect(screen.getByText('Bingo')).toBeInTheDocument();
  });

  it('renders the theme toggle', () => {
    render(
      <Shell>
        <p>Child content</p>
      </Shell>
    );
    // ThemeToggle renders a button with aria-label containing "switch to"
    const toggleButton = screen.getByRole('button', { name: /switch to/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Shell>
        <p data-testid="child">Test child</p>
      </Shell>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('has the glassmorphic header class', () => {
    const { container } = render(
      <Shell>
        <p>Child</p>
      </Shell>
    );
    expect(container.querySelector('.glass-header')).toBeInTheDocument();
  });

  it('has the wordmark-gradient class on the wordmark link', () => {
    render(
      <Shell>
        <p>Child</p>
      </Shell>
    );
    const wordmark = screen.getByText('Bingo');
    expect(wordmark).toHaveClass('wordmark-gradient');
  });
});
