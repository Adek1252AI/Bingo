
'use client';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onLoad: () => void;
}

/** Input for pasting a share link to load a shared board. */
export default function LoadBoardForm({ value, onChange, onLoad }: Props) {
  return (
    <section style={styles.wrapper}>
      <h2>Load a shared board</h2>
      <p style={styles.note}>
        Received a share link? Paste it here to play the same board —
        same words, your own cell arrangement.
      </p>
      <div style={styles.row}>
        <input
          type="text"
          placeholder="Paste a share link…"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onLoad();
          }}
          style={styles.input}
        />
        <button style={styles.button} onClick={onLoad}>
          Load
        </button>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { marginTop: '1.5rem', padding: '1rem', background: '#f0f4ff', borderRadius: 8 },
  note: { fontSize: '0.85rem', color: '#444', marginBottom: '0.5rem' },
  row: { display: 'flex', gap: '0.5rem' },
  input: {
    flex: 1,
    padding: '0.4rem 0.6rem',
    border: '1px solid #999',
    borderRadius: 4,
    fontSize: '0.85rem',
    background: '#fff',
  },
  button: {
    padding: '0.4rem 0.8rem',
    background: '#0066cc',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};
