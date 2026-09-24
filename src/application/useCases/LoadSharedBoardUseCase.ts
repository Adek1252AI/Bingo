import { Board } from '../../domain/entities';
import { validateBoard } from '../../domain/rules/board-rules';
import { EncodingAdapter } from '../../infrastructure/sharing/EncodingAdapter';
import { ArrangementEngine } from '../../infrastructure/sharing/ArrangementEngine';

/** Shape of the decoded share-link payload. */
interface SharePayload {
  words: string[];
  seed: string;
  topic: string;
}

/** A 5x5 board has 24 playing cells (the center is always FREE). */
const REQUIRED_WORD_COUNT = 24;

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

  /**
   * Loads a shared board from a share link.
   *
   * Accepts a full share URL (…/#<payload>), a bare hash fragment (#<payload>
   * or <payload>), or a legacy path URL (…/<payload>). Throws an Error with a
   * user-friendly message when the link is empty, undecodable, or malformed.
   */
  execute(link: string): LoadSharedBoardResult {
    const payload = this.decodePayload(link);

    // Validate the payload — reject duplicate words (EC-09 fix).
    validateBoard({ words: payload.words });

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

  private decodePayload(link: string): SharePayload {
    const fragment = this.extractFragment(link);
    let decoded: unknown;
    try {
      decoded = this.encodingAdapter.decode(fragment);
    } catch {
      throw new Error('Invalid share link: the encoded payload could not be decoded.');
    }
    return this.validatePayload(decoded);
  }

  /** Extracts the encoded payload string from a pasted link or fragment. */
  private extractFragment(link: string): string {
    const trimmed = link.trim();
    if (!trimmed) {
      throw new Error('Paste a share link first.');
    }

    const hashIndex = trimmed.indexOf('#');
    if (hashIndex >= 0) {
      // Hash fragment (…/#<payload>), possibly with a leading slash (…/#/<payload>).
      const fragment = trimmed.substring(hashIndex + 1).replace(/^\/+/, '');
      if (!fragment) {
        throw new Error('Invalid share link: the payload is empty.');
      }
      return fragment;
    }

    // No hash: either a legacy path URL (…/Bingo/<payload>) or a raw payload.
    // base64url contains no '/', so the payload is the last path segment.
    const lastSlash = trimmed.lastIndexOf('/');
    const payload = lastSlash >= 0 ? trimmed.substring(lastSlash + 1) : trimmed;
    if (!payload) {
      throw new Error('Invalid share link: the payload is empty.');
    }
    return payload;
  }

  /** Validates the decoded payload: { words: string[24], seed: string, topic: string }. */
  private validatePayload(decoded: unknown): SharePayload {
    if (typeof decoded !== 'object' || decoded === null || Array.isArray(decoded)) {
      throw new Error('Invalid share link: the payload has the wrong shape.');
    }
    const { words, seed, topic } = decoded as Record<string, unknown>;

    if (!Array.isArray(words) || words.some(w => typeof w !== 'string' || w.length === 0)) {
      throw new Error('Invalid share link: the word list is missing or malformed.');
    }
    // Word count and duplicate validation are delegated to validateBoard
    // (domain rules) so there is a single source of truth for board validity.
    if (typeof seed !== 'string' || seed.length === 0) {
      throw new Error('Invalid share link: the seed is missing.');
    }
    if (typeof topic !== 'string') {
      throw new Error('Invalid share link: the topic is missing.');
    }

    return { words, seed, topic };
  }

  private generatePlayerSeed(): string {
    return Math.random().toString(36).substring(2, 14);
  }
}
