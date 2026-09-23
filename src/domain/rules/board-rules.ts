
import { Board, Topic } from '../entities';

export function validateBoard(board: Board): void {
  if (board.words.length !== 24) {
    throw new Error(`Board must have exactly 24 words, got ${board.words.length}`);
  }
  const unique = new Set(board.words);
  if (unique.size !== 24) {
    throw new Error('Board must have 24 unique words — duplicates found');
  }
}

export function validateTopic(topic: Topic): void {
  if (topic.words.length < 24) {
    throw new Error(`Topic "${topic.name}" has only ${topic.words.length} words — need at least 24 for a full board`);
  }
  const unique = new Set(topic.words);
  if (unique.size !== topic.words.length) {
    throw new Error(`Topic "${topic.name}" contains duplicate words`);
  }
}
