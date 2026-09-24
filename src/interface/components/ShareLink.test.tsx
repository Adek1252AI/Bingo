import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import ShareLink from './ShareLink';

// Mock the clipboard API for all tests
const mockWriteText = vi.fn(() => Promise.resolve());

// jsdom does not implement document.execCommand; provide a controllable mock.
// Defaults to true (fallback succeeds) — failure tests override it.
const mockExecCommand = vi.fn(() => true);

beforeEach(() => {
  mockWriteText.mockClear();
  // mockReset (not mockClear): tests override the return value with
  // mockReturnValue/mockImplementation, which mockClear does not undo.
  mockExecCommand.mockReset();
  mockExecCommand.mockImplementation(() => true);
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockWriteText,
    },
    writable: true,
    configurable: true,
  });
  document.execCommand = mockExecCommand;
});

afterEach(() => {
  // jsdom leaves execCommand undefined; restore that between tests.
  delete (document as { execCommand?: unknown }).execCommand;
});

describe('ShareLink', () => {
  const testEncoded = 'eyJ3b3JkcyI6WyJhIiwiYiIsImMiLCJkIiwiZSIsImYiLCJoIiwiaSIsImoiLCJrIiwibCIsIm0iLCJuIiwibyIsInAiLCJyIiwicyIsInQiLCJ1IiwidiIsInciLCJ5IiwieiIsIlhceTAwMDAiXSwic2VlZCI6InRlc3RTZWVkIiwidG9waWMiOiJUZXN0VG9waWMifQ';

  it('renders the share link input with the encoded URL', () => {
    render(<ShareLink encoded={testEncoded} />);
    const input = screen.getByDisplayValue(new RegExp(testEncoded));
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'share-link');
  });

  it('renders a copy button', () => {
    render(<ShareLink encoded={testEncoded} />);
    const copyButton = screen.getByRole('button', { name: /copy/i });
    expect(copyButton).toBeInTheDocument();
  });

  it('clicking copy button writes the full URL to clipboard', async () => {
    render(<ShareLink encoded={testEncoded} />);
    const copyButton = screen.getByRole('button', { name: /copy/i });

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });

    // Verify it wrote the full URL (origin + pathname + # + encoded)
    const writtenUrl = mockWriteText.mock.calls[0][0];
    expect(writtenUrl).toContain(testEncoded);
    expect(writtenUrl).toContain('#');
  });

  it('shows "Copied!" feedback after a successful copy (CB-02)', async () => {
    render(<ShareLink encoded={testEncoded} />);
    const copyButton = screen.getByRole('button', { name: /copy/i });

    fireEvent.click(copyButton);

    // CB-02 requires the confirmation to be visible within 1 second
    await waitFor(() => {
      expect(copyButton).toHaveTextContent('Copied!');
    }, { timeout: 1000 });
  });

  it('reverts the button text to "Copy" after 2 seconds', async () => {
    vi.useFakeTimers();
    try {
      render(<ShareLink encoded={testEncoded} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });

      fireEvent.click(copyButton);
      // Flush the async clipboard promise so the status state updates
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(copyButton).toHaveTextContent('Copied!');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(copyButton).toHaveTextContent(/^Copy$/);
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows failure feedback and selects the input when clipboard fails', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard access denied'));
    // Both copy paths must fail for the error state to appear.
    mockExecCommand.mockReturnValue(false);

    render(<ShareLink encoded={testEncoded} />);
    const copyButton = screen.getByRole('button', { name: /copy/i });
    const input = screen.getByDisplayValue(new RegExp(testEncoded)) as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(copyButton).toHaveTextContent('Copy failed');
    });
    // Error styling (destructive token) so the failure is visibly distinct
    expect(copyButton).toHaveStyle({ background: 'var(--destructive)' });
    // Last-resort fallback: select the input so the user can copy manually.
    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  it('restarts the feedback timer on repeated clicks (rapid clicking keeps feedback)', async () => {
    vi.useFakeTimers();
    try {
      render(<ShareLink encoded={testEncoded} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });

      fireEvent.click(copyButton);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(copyButton).toHaveTextContent('Copied!');

      // 1.5s later click again: the revert timer must restart, not fire at t=2s
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1500);
      });
      fireEvent.click(copyButton);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      expect(copyButton).toHaveTextContent('Copied!');

      // Full 2s after the LAST click it reverts
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      expect(copyButton).toHaveTextContent(/^Copy$/);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps a stable accessible name while showing feedback', async () => {
    render(<ShareLink encoded={testEncoded} />);
    const copyButton = screen.getByRole('button', { name: /copy/i });

    fireEvent.click(copyButton);
    await waitFor(() => {
      expect(copyButton).toHaveTextContent('Copied!');
    });

    // E2E locators use getByRole('button', { name: 'Copy' }); the accessible
    // name must not change when the visible label flips to "Copied!".
    expect(screen.getByRole('button', { name: 'Copy' })).toBe(copyButton);
  });

  describe('execCommand fallback', () => {
    it('copies via execCommand when the Clipboard API rejects, and still shows "Copied!"', async () => {
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard access denied'));

      render(<ShareLink encoded={testEncoded} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(copyButton).toHaveTextContent('Copied!');
      });
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
    });

    it('copies via execCommand when navigator.clipboard is unavailable entirely', async () => {
      // Older browsers / non-secure contexts: no clipboard API at all.
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(<ShareLink encoded={testEncoded} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(copyButton).toHaveTextContent('Copied!');
      });
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
    });

    it('shows "Copy failed" when execCommand throws', async () => {
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard access denied'));
      mockExecCommand.mockImplementation(() => {
        throw new TypeError('execCommand is not a function');
      });

      render(<ShareLink encoded={testEncoded} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(copyButton).toHaveTextContent('Copy failed');
      });
    });

    it('reverts "Copy failed" back to "Copy" after 2 seconds', async () => {
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard access denied'));
      mockExecCommand.mockReturnValue(false);

      vi.useFakeTimers();
      try {
        render(<ShareLink encoded={testEncoded} />);
        const copyButton = screen.getByRole('button', { name: /copy/i });

        fireEvent.click(copyButton);
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
        expect(copyButton).toHaveTextContent('Copy failed');

        await act(async () => {
          await vi.advanceTimersByTimeAsync(2000);
        });
        expect(copyButton).toHaveTextContent(/^Copy$/);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  it('clicking the input selects its text', () => {
    render(<ShareLink encoded={testEncoded} />);
    const input = screen.getByDisplayValue(new RegExp(testEncoded)) as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');
    
    fireEvent.click(input);
    
    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockRestore();
  });
});
