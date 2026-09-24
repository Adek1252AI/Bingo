
'use client';

import { useEffect, useRef, useState } from 'react';
import AnimatedButton from '@/interface/components/AnimatedButton';

interface Props {
  encoded: string;
}

type CopyStatus = 'idle' | 'copied' | 'failed';

// How long the "Copied!" / "Copy failed" feedback stays visible before the
// button reverts to its resting label.
const FEEDBACK_MS = 2000;

// Fallback for browsers without the async Clipboard API (or where it is
// blocked, e.g. non-secure contexts). Returns true when the copy succeeded.
function copyViaExecCommand(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  // Keep the textarea out of the viewport and out of the tab order.
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    // Always clean up, even when execCommand throws.
    textarea.remove();
  }
}

export default function ShareLink({ encoded }: Props) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The payload travels in the URL fragment (after '#'): it never reaches the
  // server, so this works on any static host (including GitHub Pages subpaths).
  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#${encoded}`
    : `#${encoded}`;

  // Never leave a pending revert timer behind when the component unmounts.
  useEffect(() => {
    return () => {
      if (revertTimer.current) clearTimeout(revertTimer.current);
    };
  }, []);

  function scheduleRevert() {
    // Repeated clicks restart the timer so the feedback window always starts
    // from the most recent click instead of cutting out early.
    if (revertTimer.current) clearTimeout(revertTimer.current);
    revertTimer.current = setTimeout(() => setStatus('idle'), FEEDBACK_MS);
  }

  async function handleCopy() {
    const input = document.getElementById('share-link') as HTMLInputElement | null;
    const link = input ? input.value : '';
    let copied = false;
    try {
      await navigator.clipboard.writeText(link);
      copied = true;
    } catch {
      // Clipboard API unavailable (older browsers, non-secure contexts) or
      // permission denied: fall back to the deprecated execCommand('copy')
      // through a temporary off-screen textarea.
      copied = copyViaExecCommand(link);
    }
    setStatus(copied ? 'copied' : 'failed');
    if (!copied) {
      // Last resort: select the input so the user can copy manually.
      input?.select();
    }
    scheduleRevert();
  }

  const label = status === 'copied' ? 'Copied!' : status === 'failed' ? 'Copy failed' : 'Copy';

  return (
    <div style={styles.wrapper}>
      <h3>Share this board</h3>
      <p style={styles.note}>
        Send this link to a friend — same words, different cells.
      </p>
      <div style={styles.linkRow}>
        <input
          type="text"
          readOnly
          value={fullUrl}
          style={styles.input}
          onClick={e => (e.target as HTMLInputElement).select()}
          id="share-link"
        />
        {/* aria-label keeps the accessible name stable ("Copy") even while the
            visible label flips to "Copied!" / "Copy failed", so screen readers
            and test locators keep finding the same button. */}
        <AnimatedButton
          style={status === 'copied' ? styles.copyBtnSuccess : status === 'failed' ? styles.copyBtnError : styles.copyBtn}
          onClick={handleCopy}
          aria-label="Copy"
        >
          {label}
        </AnimatedButton>
      </div>
      <p style={styles.hint}>
        Paste the link into a new tab to load the shared board.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { marginTop: '1.5rem', padding: '1rem', background: '#f0f4ff', borderRadius: 8 },
  note: { fontSize: '0.85rem', color: '#444', marginBottom: '0.5rem' },
  linkRow: { display: 'flex', gap: '0.5rem' },
  input: {
    flex: 1,
    padding: '0.4rem 0.6rem',
    border: '1px solid #999',
    borderRadius: 4,
    fontSize: '0.85rem',
    background: '#fff',
  },
  copyBtn: {
    padding: '0.4rem 0.8rem',
    background: '#0066cc',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  copyBtnSuccess: {
    padding: '0.4rem 0.8rem',
    background: '#1a7f37',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  copyBtnError: {
    padding: '0.4rem 0.8rem',
    background: '#b3261e',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  hint: { fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' },
};
