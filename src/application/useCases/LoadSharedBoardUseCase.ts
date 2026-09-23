
import { Board } from '../../domain/entities';
import { EncodingAdapter } from '../../infrastructure/sharing/EncodingAdapter';
import { ArrangementEngine } from '../../infrastructure/sharing/ArrangementEngine';

/** Shape of the decoded share-link payload. */
interface SharePayload {
  words: string[];
  seed: string;
  topic: string;
}

export interface LoadSharedBoardResult {
  board: Board;
  arrangement: string[][];   // 5x5 grid; position [2][2] is the free cell
  topic: string;
  shareSeed: string;
}

export class LoadSharedBoardUseCase {
  constructor(
    private encodingAdapter: EncodingAdapter,
    private arrangementEngine: ArrangementEngine
  ) {}

  execute(encodedLink: string): LoadSharedBoardResult {
    const payload = this.encodingAdapter.decode(encodedLink) as SharePayload;
    const playerSeed = this.generatePlayerSeed();
    const arrangement = this.arrangementEngine.arrange(
      payload.words,
      payload.seed,
      playerSeed
    );
    return {
      board: { words: payload.words },
      arrangement,
      topic: payload.topic,
      shareSeed: payload.seed,
    };
  }

  private generatePlayerSeed(): string {
    return Math.random().toString(36).substring(2, 14);
  }
}
