'use client';

import { useEffect, useState } from 'react';
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
    <main style={styles.main}>
      <h1>Bingo</h1>

      <TopicPicker
        topics={wordPoolRepo.listTopics()}
        selected={topic}
        onSelect={handleTopicSelect}
      />

      <button onClick={handleGenerate} disabled={loading || !topic}>
        {loading ? 'Generating...' : 'Generate Board'}
      </button>

      {error && (
        <div style={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      <LoadBoardForm
        value={shareInput}
        onChange={value => {
          setShareInput(value);
          setError(null);
        }}
        onLoad={() => handleLoadLink(shareInput)}
      />

      {board && arrangement && !error && (
        <>
          {loadedFromLink && topic && (
            <p style={styles.loadedNote}>
              Loaded shared board — topic: {topic}. Same words as your friend,
              your own cell arrangement.
            </p>
          )}
          <BoardGrid grid={arrangement} />
          {shareLink && <ShareLink encoded={shareLink} />}
        </>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 640,
    margin: '2rem auto',
    fontFamily: 'system-ui, sans-serif',
    padding: '0 1rem',
  },
  loadedNote: {
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#2a6a2a',
  },
  errorBanner: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: '#fff0f0',
    border: '1px solid #e0b4b4',
    borderRadius: 6,
    color: '#b00020',
    fontSize: '0.9rem',
  },
};
