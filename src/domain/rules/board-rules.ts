import { Board, Topic } from '../entities';

/**
 * Normalizes a word for duplicate comparison: trims whitespace and
 * lowercases so that 'Foo', 'foo', and '  foo  ' all collide.
 */
function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

/**
 * Returns a list of duplicate words found in the given list, normalized
 * (trimmed + lowercased). Returns an empty array if all words are unique.
 */
export function findDuplicates(words: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const word of words) {
    const normalized = normalizeWord(word);
    if (seen.has(normalized)) {
      duplicates.add(normalized);
    } else {
      seen.add(normalized);
    }
  }
  return [...duplicates];
}

export function validateBoard(board: Board): void {
  if (board.words.length !== 24) {
    throw new Error(`Board must have exactly 24 words, got ${board.words.length}`);
  }
  const duplicates = findDuplicates(board.words);
  if (duplicates.length > 0) {
    throw new Error(
      `Board must have 24 unique words — duplicates found: ${duplicates.join(', ')}`
    );
  }
}

export function validateTopic(topic: Topic): void {
  if (topic.words.length < 24) {
    throw new Error(
      `Topic "${topic.name}" has only ${topic.words.length} words — need at least 24 for a full board`
    );
  }
  const duplicates = findDuplicates(topic.words);
  if (duplicates.length > 0) {
    throw new Error(
      `Topic "${topic.name}" contains duplicate words: ${duplicates.join(', ')}`
    );
  }
}
