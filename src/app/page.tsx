'use client';

import { useEffect, useState } from 'react';
import Shell from '@/interface/components/Shell';
import TopicPicker from '@/interface/components/TopicPicker';
import BoardGrid from '@/interface/components/BoardGrid';
import ShareLink from '@/interface/components/ShareLink';
import LoadBoardForm from '@/interface/components/LoadBoardForm';
import { GenerateRandomBoardUseCase } from '@/application/useCases/GenerateRandomBoardUseCase';
import { CreateShareLinkUseCase } from '@/application/useCases/CreateShareLinkUseCase';
import { LoadSharedBoardUseCase, LoadSharedBoardResult } from '@/application/useCases/LoadSharedBoardUseCase';
import { StaticWordPoolRepository } from '@/infrastructure/wordPool/StaticWordPoolRepository';
import { JsonBase64EncodingAdapter } from '@/infrastructure/sharing/EncodingAdapter';
import { DeterministicArrangementEngine } from '@/infrastructure/sharing/ArrangementEngine';

const wordPoolRepo = new StaticWordPoolRepository();
const encodingAdapter = new JsonBase64EncodingAdapter();
const arrangementEngine = new DeterministicArrangementEngine();

const generateBoard = new GenerateRandomBoardUseCase(wordPoolRepo);
const createLink = new CreateShareLinkUseCase(encodingAdapter);
const loadBoard = new LoadSharedBoardUseCase(encodingAdapter, arrangementEngine);

export default function HomePage() {
  const [topic, setTopic] = useState<string | null>(null);
  const [board, setBoard] = useState<{ words: string[] } | null>(null);
  const [arrangement, setArrangement] = useState<string[][] | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareInput, setShareInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadedFromLink, setLoadedFromLink] = useState(false);
  const [loadedTopic, setLoadedTopic] = useState<string | null>(null);

  // If the page is opened with a share link (#<payload> in the URL), load it
  // automatically. The fragment never reaches the server, so this works on
  // any static host. Runs once on mount, client-side only.
  useEffect(() => {
    if (window.location.hash) {
      handleLoadLink(window.location.hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    if (!topic) return;
    setError(null);
    setLoading(true);
    try {
      const newBoard = generateBoard.execute(topic);
      setBoard(newBoard);
      const grid = arrangementEngine.arrange(newBoard.words, Math.random().toString(36).substring(2, 14), Math.random().toString(36).substring(2, 14));
      setArrangement(grid);
      const link = createLink.execute(newBoard, topic);
      setShareLink(link);
      setLoadedFromLink(false);
      setLoadedTopic(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while generating the board.');
    } finally {
      setLoading(false);
    }
  };

  /** Loads a shared board from a pasted link or the current URL hash. */
  const handleLoadLink = (link: string) => {
    setError(null);
    try {
      const result = loadBoard.execute(link);
      setBoard(result.board);
      setArrangement(result.arrangement);
      setTopic(result.topic);
      setShareLink(null);
      setLoadedFromLink(true);
      setLoadedTopic(result.topic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the shared board.');
    }
  };

  /** Clears error when user picks a new topic. */
  const handleTopicSelect = (newTopic: string | null) => {
    setError(null);
    setTopic(newTopic);
  };

  return (
    <Shell>
      {/* Topic picker — full width in bento grid */}
      <div className="bento-grid__full" style={styles.tile}>
        <TopicPicker
          topics={wordPoolRepo.listTopics()}
          selected={topic}
          onSelect={handleTopicSelect}
        />
      </div>

      {/* Generate button — full width */}
      <div className="bento-grid__full" style={{ padding: '0 0.5rem' }}>
        <button
          onClick={handleGenerate}
          disabled={loading || !topic}
          style={{
            ...styles.button,
            ...(loading || !topic ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? 'Generating...' : 'Generate Board'}
        </button>
      </div>

      {/* Error banner — full width */}
      {error && (
        <div className="bento-grid__full" role="alert" style={{ padding: '0 0.5rem' }}>
          <div style={styles.errorBanner}>{error}</div>
        </div>
      )}

      {/* Load form — full width */}
      <div className="bento-grid__full" style={styles.tile}>
        <LoadBoardForm
          value={shareInput}
          onChange={value => {
            setShareInput(value);
            setError(null);
          }}
          onLoad={() => handleLoadLink(shareInput)}
        />
      </div>

      {/* Board + share — featured tile spans 2 columns */}
      {board && arrangement && !error && (
        <div className="bento-grid__board">
          {loadedFromLink && loadedTopic && (
            <p style={styles.loadedNote}>
              Loaded shared board — topic: {loadedTopic}. Same words as your friend,
              your own cell arrangement.
            </p>
          )}
          <BoardGrid grid={arrangement} />
          {shareLink && <ShareLink encoded={shareLink} />}
        </div>
      )}
    </Shell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tile: {
    padding: '0 0.5rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem 1.5rem',
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 150ms ease, transform 150ms ease',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  loadedNote: {
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: 'oklch(0.66 0.23 145)',
  },
  errorBanner: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
  },
};
