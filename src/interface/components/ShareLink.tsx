
'use client';

interface Props {
  encoded: string;
}

export default function ShareLink({ encoded }: Props) {
  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${encoded}`
    : `/${encoded}`;

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
        />
        <button style={styles.copyBtn} onClick={copy}>
          Copy
        </button>
      </div>
      <p style={styles.hint}>
        Paste the link into a new tab to load the shared board.
      </p>
    </div>
  );
}

async function copy() {
  try {
    await navigator.clipboard.writeText(
      typeof window !== 'undefined' ? window.location.origin + '/' + document.querySelector('input')?.value : ''
    );
  } catch {
    // fallback: select the input
    const input = document.querySelector('input') as HTMLInputElement;
    input?.select();
  }
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
  hint: { fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' },
};
