
'use client';

import AnimatedButton from '@/interface/components/AnimatedButton';

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
      <p style={styles.note} id="load-board-hint">
        Received a share link? Paste it here to play the same board —
        same words, your own cell arrangement.
      </p>
      <div style={styles.row}>
        <label htmlFor="share-link-input" style={styles.visuallyHidden}>
          Share link
        </label>
        <input
          id="share-link-input"
          type="text"
          placeholder="Paste a share link…"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onLoad();
          }}
          aria-describedby="load-board-hint"
          style={styles.input}
        />
        <AnimatedButton style={styles.button} onClick={onLoad}>
          Load
        </AnimatedButton>
      </div>
    </section>
  );
}

/* Visually hidden but available to screen readers (WCAG 1.3.1 / 4.1.2):
   the input gets a real accessible name, not just a placeholder. */
const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'var(--surface)',
    color: 'var(--surface-foreground)',
    borderRadius: 8,
  },
  note: { fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' },
  row: { display: 'flex', gap: '0.5rem' },
  input: {
    flex: 1,
    padding: '0.4rem 0.6rem',
    border: '1px solid var(--input)',
    borderRadius: 4,
    fontSize: '0.85rem',
    background: 'var(--surface-elevated)',
    color: 'var(--text-primary)',
  },
  button: {
    padding: '0.4rem 0.8rem',
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  visuallyHidden,
};
