'use client';

import { Topic } from '@/domain/entities';

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
    padding: '1rem',
    borderRadius: 12,
    backgroundColor: 'color-mix(in oklch, var(--surface-elevated) 85%, transparent)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' },
  radio: { accentColor: 'var(--accent)' },
  text: { fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' },
};
