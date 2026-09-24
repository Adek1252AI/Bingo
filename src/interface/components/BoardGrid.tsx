import { Board } from '@/domain/entities';

interface Props {
  grid: string[][];
}

export default function BoardGrid({ grid }: Props) {
  return (
    <div style={styles.wrapper}>
      <h2>Your Board</h2>
      <div style={styles.grid}>
        {grid.map((row, r) => (
          <div key={r} style={styles.row}>
            {row.map((cell, c) => (
              <div
                key={c}
                style={{
                  ...styles.cell,
                  ...(cell === 'FREE' ? styles.free : {}),
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { marginTop: '1.5rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.25rem',
    /* Ensure grid has a minimum width so cells don't collapse on small screens */
    minWidth: 0,
  },
  row: { display: 'contents' },
  cell: {
    /* Square cells that maintain uniform dimensions */
    aspectRatio: '1',
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    /* Center content */
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    /* Consistent sizing and spacing */
    padding: '0.25rem',
    boxSizing: 'border-box',
    /* Visual styling */
    background: '#fff',
    border: '1px solid #999',
    borderRadius: 4,
    fontWeight: 600,
    /* Fluid font size that adapts to cell size but stays readable */
    fontSize: 'clamp(0.65rem, 2vw, 0.95rem)',
    /* Prevent text overflow from expanding the cell */
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    /* Ensure text doesn't wrap to multiple lines */
    lineHeight: 1.2,
  },
  free: { background: '#eee', color: '#666', fontStyle: 'italic' },
};
