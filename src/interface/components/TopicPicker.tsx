
import { Topic } from '@/domain/entities';

'use client';

interface Props {
  topics: Topic[];
  selected: string | null;
  onSelect: (name: string) => void;
}

export default function TopicPicker({ topics, selected, onSelect }: Props) {
  return (
    <fieldset style={styles.fieldset}>
      <legend>Pick a topic</legend>
      <div style={styles.list}>
        {topics.map(t => (
          <label key={t.name} style={styles.label}>
            <input
              type="radio"
              name="topic"
              value={t.name}
              checked={selected === t.name}
              onChange={() => onSelect(t.name)}
              style={styles.radio}
            />
            <span style={styles.text}>
              {t.name} ({t.words.length} words)
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fieldset: {
    border: '1px solid var(--border)',
    padding: '0.75rem',
    borderRadius: 6,
    backgroundColor: 'var(--surface-elevated)',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
  radio: { accentColor: 'var(--primary)' },
  text: { fontWeight: 500 },
};
