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

  it('has the site-header class on the header', () => {
    const { container } = render(
      <Shell>
        <p>Child</p>
      </Shell>
    );
    expect(container.querySelector('.site-header')).toBeInTheDocument();
  });

  it('renders the logo image', () => {
    const { container } = render(
      <Shell>
        <p>Child</p>
      </Shell>
    );
    const logo = container.querySelector('.site-header__logo');
    expect(logo).toBeInTheDocument();
    expect(logo?.tagName).toBe('IMG');
  });
});
