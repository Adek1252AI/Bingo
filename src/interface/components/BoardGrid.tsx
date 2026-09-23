
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.25rem' },
  row: { display: 'contents' },
  cell: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    border: '1px solid #999',
    borderRadius: 4,
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  free: { background: '#eee', color: '#666', fontStyle: 'italic' },
};
