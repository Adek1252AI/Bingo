'use client';

import { useEffect, useRef, useState } from 'react';
import Shell from '@/interface/components/Shell';
import TopicPicker from '@/interface/components/TopicPicker';
import BoardGrid from '@/interface/components/BoardGrid';
import ShareLink from '@/interface/components/ShareLink';
import LoadBoardForm from '@/interface/components/LoadBoardForm';
import WinCelebration from '@/interface/components/WinCelebration';
import AnimatedButton from '@/interface/components/AnimatedButton';
import { GenerateRandomBoardUseCase } from '@/application/useCases/GenerateRandomBoardUseCase';
import { CreateShareLinkUseCase } from '@/application/useCases/CreateShareLinkUseCase';
import { LoadSharedBoardUseCase, LoadSharedBoardResult } from '@/application/useCases/LoadSharedBoardUseCase';
import { StaticWordPoolRepository } from '@/infrastructure/wordPool/StaticWordPoolRepository';
import { JsonBase64EncodingAdapter } from '@/infrastructure/sharing/EncodingAdapter';
import { DeterministicArrangementEngine } from '@/infrastructure/sharing/ArrangementEngine';
import { checkBingo, countBingoLines, type Cell } from '@/domain/rules/bingo-rules';

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

  // Game state: words the player has marked (daubed) on their board, and the
  // win celebration. entranceKey re-triggers the stagger animation per board.
  const [daubed, setDaubed] = useState<string[]>([]);
  const [celebrating, setCelebrating] = useState(false);
  const [boardCount, setBoardCount] = useState(0);
  // Guards the celebration: one burst per won board, re-armed on new board
  // or when the player un-daubs out of the winning state.
  const celebratedRef = useRef(false);

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
      // Fresh board: clear marks, re-arm the celebration, and re-trigger
      // the entrance stagger.
      setDaubed([]);
      setCelebrating(false);
      celebratedRef.current = false;
      setBoardCount(count => count + 1);
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
      // Fresh board: clear marks, re-arm the celebration, and re-trigger
      // the entrance stagger.
      setDaubed([]);
      setCelebrating(false);
      celebratedRef.current = false;
      setBoardCount(count => count + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the shared board.');
    }
  };

  /**
   * Marks/unmarks a word on the player's board (daub). Uses the functional
   * updater so rapid consecutive daubs (batched by React in one frame) all
   * apply — a stale-closure read would silently drop all but the last.
   */
  const handleCellToggle = (word: string) => {
    setDaubed(prev =>
      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
    );
  };

  // Win check on the derived marks. Celebrates only on the transition
  // no-win -> win (celebratedRef guards re-firing on every later daub while
  // the board is still winning); un-daubing out of a win re-arms it.
  useEffect(() => {
    const hasWin = arrangement
      ? checkBingo(arrangement, daubed).length > 0
      : false;
    if (hasWin && !celebratedRef.current) {
      celebratedRef.current = true;
      setCelebrating(true);
    }
    if (!hasWin) {
      celebratedRef.current = false;
    }
  }, [arrangement, daubed]);

  /** Closes the win celebration; daubs stay so the board keeps its marks. */
  const handleCelebrationClose = () => setCelebrating(false);

  // Derived win state: which cells sit on a completed line, and how many
  // lines completed. Empty/0 when there is no win.
  const winningCells: Cell[] = arrangement ? checkBingo(arrangement, daubed) : [];
  const winLineCount = arrangement ? countBingoLines(arrangement, daubed) : 0;

  /** Clears error when user picks a new topic. */
  const handleTopicSelect = (newTopic: string | null) => {
    setError(null);
    setTopic(newTopic);
  };

  const hasBoard = board && arrangement && !error;

  return (
    <Shell>
      {/* Controls section — moves below board when board is active */}
      <div
        className="bento-grid__full"
        style={hasBoard ? styles.controlsBelow : undefined}
      >
        <div className="bento-grid__full" style={styles.tile}>
          <TopicPicker
            topics={wordPoolRepo.listTopics()}
            selected={topic}
            onSelect={handleTopicSelect}
          />
        </div>

        {/* Generate button — full width */}
        <div style={{ padding: '0 0.5rem' }}>
          <AnimatedButton
            onClick={handleGenerate}
            disabled={loading || !topic}
            style={{
              ...styles.button,
              ...(loading || !topic ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Generating...' : 'Generate Board'}
          </AnimatedButton>
        </div>

        {/* Error banner — full width */}
        {error && (
          <div role="alert" style={{ padding: '0 0.5rem' }}>
            <div style={styles.errorBanner}>{error}</div>
          </div>
        )}

        {/* Load form — full width */}
        <div style={styles.tile}>
          <LoadBoardForm
            value={shareInput}
            onChange={value => {
              setShareInput(value);
              setError(null);
            }}
            onLoad={() => handleLoadLink(shareInput)}
          />
        </div>
      </div>

      {/* Board + share — appears above controls when active */}
      {hasBoard && (
        <div className="bento-grid__board" style={styles.boardSection}>
          {loadedFromLink && loadedTopic && (
            <p style={styles.loadedNote}>
              Loaded shared board — topic: {loadedTopic}. Same words as your friend,
              your own cell arrangement.
            </p>
          )}
          <BoardGrid
            grid={arrangement}
            called={daubed}
            entranceKey={`board-${boardCount}`}
            winningCells={winningCells}
            onCellToggle={handleCellToggle}
          />
          {shareLink && <ShareLink encoded={shareLink} />}
        </div>
      )}
      {/* BINGO! win celebration — confetti + modal */}
      <WinCelebration
        open={celebrating}
        onClose={handleCelebrationClose}
        lines={winLineCount}
      />
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
    color: 'var(--success-text)',
  },
  errorBanner: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
  },
  boardSection: {
    order: -1,
  },
  controlsBelow: {
    order: 1,
  },
};
