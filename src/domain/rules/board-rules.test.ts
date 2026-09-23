import { describe, it, expect } from 'vitest';
import { validateBoard, validateTopic, findDuplicates } from './board-rules';

describe('findDuplicates', () => {
  it('returns an empty array for all-unique words', () => {
    expect(findDuplicates(['apple', 'banana', 'cherry'])).toEqual([]);
  });

  it('finds exact duplicates', () => {
    expect(findDuplicates(['apple', 'apple'])).toEqual(['apple']);
  });

  it('is case-insensitive: Foo and foo collide', () => {
    expect(findDuplicates(['Foo', 'foo'])).toEqual(['foo']);
  });

  it('is case-insensitive: FOO and foo collide', () => {
    expect(findDuplicates(['FOO', 'foo'])).toEqual(['foo']);
  });

  it('ignores leading/trailing whitespace when comparing', () => {
    expect(findDuplicates(['apple', '  apple  '])).toEqual(['apple']);
  });

  it('normalizes mixed whitespace and case', () => {
    expect(findDuplicates(['Foo Bar', '  foo bar  '])).toEqual(['foo bar']);
  });

  it('reports each duplicate only once', () => {
    expect(findDuplicates(['x', 'x', 'x', 'X'])).toEqual(['x']);
  });

  it('finds multiple distinct duplicates', () => {
    const result = findDuplicates(['a', 'b', 'a', 'c', 'b']);
    expect(result).toContain('a');
    expect(result).toContain('b');
    expect(result).toHaveLength(2);
  });

  it('handles empty array', () => {
    expect(findDuplicates([])).toEqual([]);
  });

  it('treats whitespace-only words as duplicates of each other', () => {
    // Both normalize to '' (empty string after trim+lowercase)
    expect(findDuplicates(['  ', ' '])).toEqual(['']);
  });
});

describe('validateBoard', () => {
  it('accepts a valid board with 24 unique words', () => {
    const words = Array.from({ length: 24 }, (_, i) => `word-${i}`);
    expect(() => validateBoard({ words })).not.toThrow();
  });

  it('throws when the board has fewer than 24 words', () => {
    const words = Array.from({ length: 23 }, (_, i) => `word-${i}`);
    expect(() => validateBoard({ words })).toThrow(/must have exactly 24 words, got 23/);
  });

  it('throws when the board has more than 24 words', () => {
    const words = Array.from({ length: 25 }, (_, i) => `word-${i}`);
    expect(() => validateBoard({ words })).toThrow(/must have exactly 24 words, got 25/);
  });

  it('throws when the board has an exact duplicate word', () => {
    const words = Array.from({ length: 23 }, (_, i) => `word-${i}`);
    words.push('word-0'); // exact duplicate
    expect(() => validateBoard({ words })).toThrow(/duplicates found: word-0/);
  });

  it('throws when the board has a case-insensitive duplicate', () => {
    const words = Array.from({ length: 23 }, (_, i) => `word-${i}`);
    words.push('Word-0'); // different case from 'word-0'
    expect(() => validateBoard({ words })).toThrow(/duplicates found: word-0/i);
  });

  it('throws when the board has a whitespace-padded duplicate', () => {
    const words = Array.from({ length: 23 }, (_, i) => `word-${i}`);
    words.push('  word-0  '); // padded with spaces
    expect(() => validateBoard({ words })).toThrow(/duplicates found: word-0/);
  });

  it('throws when all 24 words are identical', () => {
    const words = Array(24).fill('same-word');
    expect(() => validateBoard({ words })).toThrow(/duplicates found/);
  });

  it('does not flag words that differ only in case as duplicates when they are distinct enough', () => {
    // 'Word-0' and 'word-0' ARE duplicates (case-insensitive), so this should throw
    const words = Array.from({ length: 23 }, (_, i) => `word-${i}`);
    words.push('Word-0');
    expect(() => validateBoard({ words })).toThrow();
  });

  it('accepts 24 words that differ only by case-sensitivity boundary (truly distinct)', () => {
    // Words like 'word-0' through 'word-22' plus 'WORD-22' would be duplicates.
    // But 'word-0' through 'word-22' plus a genuinely different 24th word is fine.
    const words = Array.from({ length: 23 }, (_, i) => `word-${i}`);
    words.push('CompletelyDifferent');
    expect(() => validateBoard({ words })).not.toThrow();
  });

  it('throws when the board has an empty word list', () => {
    expect(() => validateBoard({ words: [] })).toThrow(/must have exactly 24 words, got 0/);
  });
});

describe('validateTopic', () => {
  it('accepts a valid topic with 24 unique words', () => {
    const topic = {
      name: 'Test Topic',
      words: Array.from({ length: 24 }, (_, i) => `word-${i}`),
    };
    expect(() => validateTopic(topic)).not.toThrow();
  });

  it('accepts a topic with more than 24 unique words', () => {
    const topic = {
      name: 'Large Topic',
      words: Array.from({ length: 30 }, (_, i) => `word-${i}`),
    };
    expect(() => validateTopic(topic)).not.toThrow();
  });

  it('throws when a topic has fewer than 24 words', () => {
    const topic = {
      name: 'Small Topic',
      words: Array.from({ length: 10 }, (_, i) => `word-${i}`),
    };
    expect(() => validateTopic(topic)).toThrow(/has only 10 words .* need at least 24/);
  });

  it('throws when a topic contains exact duplicate words', () => {
    const topic = {
      name: 'Duplicate Topic',
      words: Array.from({ length: 24 }, (_, i) => `word-${i % 20}`),
    };
    expect(() => validateTopic(topic)).toThrow(/contains duplicate words/);
  });

  it('throws when a topic contains case-insensitive duplicate words', () => {
    const words = Array.from({ length: 23 }, (_, i) => `word-${i}`);
    words.push('Word-0'); // case-insensitive duplicate of 'word-0'
    const topic = { name: 'Case Dup Topic', words };
    expect(() => validateTopic(topic)).toThrow(/contains duplicate words/i);
  });

  it('throws when a topic contains whitespace-padded duplicate words', () => {
    const words = Array.from({ length: 23 }, (_, i) => `word-${i}`);
    words.push('  word-0  '); // whitespace-padded duplicate
    const topic = { name: 'Whitespace Dup Topic', words };
    expect(() => validateTopic(topic)).toThrow(/contains duplicate words/);
  });

  it('throws when a topic has an empty word list', () => {
    const topic = { name: 'Empty Topic', words: [] };
    expect(() => validateTopic(topic)).toThrow(/has only 0 words .* need at least 24/);
  });

  it('accepts a topic with exactly 24 words at the boundary', () => {
    const topic = {
      name: 'Boundary Topic',
      words: Array.from({ length: 24 }, (_, i) => `word-${i}`),
    };
    expect(() => validateTopic(topic)).not.toThrow();
  });

  it('throws when only one duplicate exists among 24 words', () => {
    const words = Array.from({ length: 23 }, (_, i) => `word-${i}`);
    words.push('word-0'); // one duplicate
    const topic = { name: 'Topic', words };
    expect(() => validateTopic(topic)).toThrow(/contains duplicate words/);
  });
});
