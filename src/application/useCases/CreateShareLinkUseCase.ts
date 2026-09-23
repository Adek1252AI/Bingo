
import { Board } from '../../domain/entities';
import { EncodingAdapter } from '../../infrastructure/sharing/EncodingAdapter';

export class CreateShareLinkUseCase {
  constructor(private encodingAdapter: EncodingAdapter) {}

  execute(board: Board, topicName: string): string {
    const shareSeed = this.generateShareSeed();
    const payload = { words: board.words, seed: shareSeed, topic: topicName };
    const encoded = this.encodingAdapter.encode(payload);
    // Return as a URI-like string; the interface layer decides the full URL format
    return encoded;
  }

  private generateShareSeed(): string {
    const randomPart = Math.random().toString(36).substring(2, 10);
    const timePart = Date.now().toString(36);
    return randomPart + timePart;
  }
}
