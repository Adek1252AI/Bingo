'use client';

import { useState } from 'react';
import TopicPicker from '@/interface/components/TopicPicker';
import BoardGrid from '@/interface/components/BoardGrid';
import ShareLink from '@/interface/components/ShareLink';
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

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const newBoard = generateBoard.execute(topic);
      setBoard(newBoard);
      const grid = arrangementEngine.arrange(newBoard.words, 'local', Math.random().toString(36).substring(2, 14));
      setArrangement(grid);
      const link = createLink.execute(newBoard, topic);
      setShareLink(link);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <h1>Bingo</h1>

      <TopicPicker
        topics={wordPoolRepo.listTopics()}
        selected={topic}
        onSelect={setTopic}
      />

      <button onClick={handleGenerate} disabled={loading || !topic}>
        {loading ? 'Generating...' : 'Generate Board'}
      </button>

      {board && arrangement && (
        <>
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
};
