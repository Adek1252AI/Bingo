import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoadSharedBoardUseCase } from '@/application/useCases/LoadSharedBoardUseCase';
import { JsonBase64EncodingAdapter } from '@/infrastructure/sharing/EncodingAdapter';
import { DeterministicArrangementEngine } from '@/infrastructure/sharing/ArrangementEngine';
import { EncodingAdapter } from '@/infrastructure/sharing/EncodingAdapter';
import { ArrangementEngine } from '@/infrastructure/sharing/ArrangementEngine';
import { Board } from '@/domain/entities';

describe('LoadSharedBoardUseCase', () => {
  const words = Array.from({ length: 24 }, (_, i) => `word-${i}`);
  const payload = { words, seed: 'share-seed', topic: 'star wars' };

  // Create a mock encoding adapter that we control
  const mockEncodingAdapter = {
    encode: vi.fn().mockReturnValue('mocked-encoded'),
    decode: vi.fn(),
  };

  // Real arrangement engine for testing integration
  const arrangementEngine: ArrangementEngine = {
    arrange: vi.fn().mockReturnValue(
      Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => {
          if (r === 2 && c === 2) return 'FREE';
          const idx = r * 5 + c - (r > 2 || (r === 2 && c > 2) ? 1 : 0);
          return words[idx] || 'word-placeholder';
        })
      )
    ),
  };

  let useCase: LoadSharedBoardUseCase;

  beforeEach(() => {
    mockEncodingAdapter.decode.mockReset();
    mockEncodingAdapter.decode.mockReturnValue(payload);
    vi.mocked(arrangementEngine.arrange).mockClear();
    useCase = new LoadSharedBoardUseCase(mockEncodingAdapter, arrangementEngine);
  });

  describe('execute - happy path', () => {
    it('decodes a raw payload string', () => {
      const result = useCase.execute('raw-payload-base64');
      expect(mockEncodingAdapter.decode).toHaveBeenCalledWith('raw-payload-base64');
    });

    it('extracts the fragment from a URL with hash', () => {
      useCase.execute('https://example.com/#payload');
      expect(mockEncodingAdapter.decode).toHaveBeenCalledWith('payload');
    });

    it('extracts the fragment from a URL with hash and slash', () => {
      useCase.execute('https://example.com/#/payload');
      expect(mockEncodingAdapter.decode).toHaveBeenCalledWith('payload');
    });

    it('extracts the last path segment from a legacy URL', () => {
      useCase.execute('https://example.com/Bingo/some-payload');
      expect(mockEncodingAdapter.decode).toHaveBeenCalledWith('some-payload');
    });

    it('returns the board words', () => {
      const result = useCase.execute('valid-payload');
      expect(result.board.words).toEqual(words);
    });

    it('returns the topic', () => {
      const result = useCase.execute('valid-payload');
      expect(result.topic).toBe('star wars');
    });

    it('returns the share seed', () => {
      const result = useCase.execute('valid-payload');
      expect(result.shareSeed).toBe('share-seed');
    });

    it('returns the arrangement', () => {
      const result = useCase.execute('valid-payload');
      expect(arrangementEngine.arrange).toHaveBeenCalledWith(words, 'share-seed', expect.any(String));
      expect(result.arrangement).toHaveLength(5);
    });
  });

  describe('execute - error cases', () => {
    it('throws when the link is empty', () => {
      expect(() => useCase.execute('')).toThrow(/Paste a share link first/);
    });

    it('throws when the link is only whitespace', () => {
      expect(() => useCase.execute('   ')).toThrow(/Paste a share link first/);
    });

    it('throws when the hash fragment is empty', () => {
      expect(() => useCase.execute('https://example.com/#')).toThrow(/the payload is empty/);
    });

    it('throws when the hash fragment is only slashes', () => {
      expect(() => useCase.execute('https://example.com/#//')).toThrow(/the payload is empty/);
    });

    it('throws when decoding fails', () => {
      mockEncodingAdapter.decode.mockImplementation(() => {
        throw new Error('decode error');
      });
      expect(() => useCase.execute('invalid-payload')).toThrow(/the encoded payload could not be decoded/);
    });

    it('throws when payload is null', () => {
      mockEncodingAdapter.decode.mockReturnValue(null);
      expect(() => useCase.execute('valid-link')).toThrow(/the payload has the wrong shape/);
    });

    it('throws when payload is an array', () => {
      mockEncodingAdapter.decode.mockReturnValue([]);
      expect(() => useCase.execute('valid-link')).toThrow(/the payload has the wrong shape/);
    });

    it('throws when payload is a string', () => {
      mockEncodingAdapter.decode.mockReturnValue('not an object');
      expect(() => useCase.execute('valid-link')).toThrow(/the payload has the wrong shape/);
    });

    it('throws when words array is missing', () => {
      mockEncodingAdapter.decode.mockReturnValue({ seed: 'seed', topic: 'topic' });
      expect(() => useCase.execute('valid-link')).toThrow(/the word list is missing or malformed/);
    });

    it('throws when words array is empty', () => {
      mockEncodingAdapter.decode.mockReturnValue({ words: [], seed: 'seed', topic: 'topic' });
      expect(() => useCase.execute('valid-link')).toThrow(/expected 24 words, got 0/);
    });

    it('throws when words array has fewer than 24 items', () => {
      mockEncodingAdapter.decode.mockReturnValue({ words: words.slice(0, 20), seed: 'seed', topic: 'topic' });
      expect(() => useCase.execute('valid-link')).toThrow(/expected 24 words, got 20/);
    });

    it('throws when words array has more than 24 items', () => {
      mockEncodingAdapter.decode.mockReturnValue({ words: [...words, 'extra'], seed: 'seed', topic: 'topic' });
      expect(() => useCase.execute('valid-link')).toThrow(/expected 24 words, got 25/);
    });

    it('throws when a word is empty string', () => {
      const badWords = [...words];
      badWords[5] = '';
      mockEncodingAdapter.decode.mockReturnValue({ words: badWords, seed: 'seed', topic: 'topic' });
      expect(() => useCase.execute('valid-link')).toThrow(/the word list is missing or malformed/);
    });

    it('throws when a word is a number', () => {
      const badWords = [...words];
      badWords[3] = 42 as unknown as string;
      mockEncodingAdapter.decode.mockReturnValue({ words: badWords, seed: 'seed', topic: 'topic' });
      expect(() => useCase.execute('valid-link')).toThrow(/the word list is missing or malformed/);
    });

    it('throws when seed is empty string', () => {
      mockEncodingAdapter.decode.mockReturnValue({ words, seed: '', topic: 'topic' });
      expect(() => useCase.execute('valid-link')).toThrow(/the seed is missing/);
    });

    it('throws when seed is missing', () => {
      mockEncodingAdapter.decode.mockReturnValue({ words, topic: 'topic' });
      expect(() => useCase.execute('valid-link')).toThrow(/the seed is missing/);
    });

    it('throws when seed is a number', () => {
      mockEncodingAdapter.decode.mockReturnValue({ words, seed: 42, topic: 'topic' });
      expect(() => useCase.execute('valid-link')).toThrow(/the seed is missing/);
    });

    it('throws when topic is missing', () => {
      mockEncodingAdapter.decode.mockReturnValue({ words, seed: 'seed' });
      expect(() => useCase.execute('valid-link')).toThrow(/the topic is missing/);
    });

    it('throws when topic is a number', () => {
      mockEncodingAdapter.decode.mockReturnValue({ words, seed: 'seed', topic: 42 });
      expect(() => useCase.execute('valid-link')).toThrow(/the topic is missing/);
    });

    it('allows empty string as topic', () => {
      mockEncodingAdapter.decode.mockReturnValue({ words, seed: 'seed', topic: '' });
      expect(() => useCase.execute('valid-link')).not.toThrow();
    });

    it('handles 24 valid words with various edge-case content', () => {
      const edgeWords = [' ', '!@#$%', 'word', '日本語', '"quotes"', "'apostrophe'",
        'new\nline', 'tab\there', 'unicode-🎉', 'path/with/slashes', 'spaces in middle',
        '   ', 'a', 'word-with-dash', 'word_with_underscore', '123', 'true', 'false',
        'null', 'undefined', 'camelCase', 'snake_case', 'kebab-case', 'LastOne'];
      mockEncodingAdapter.decode.mockReturnValue({ words: edgeWords, seed: 'seed', topic: 'topic' });
      const result = useCase.execute('valid-link');
      expect(result.board.words).toEqual(edgeWords);
    });
  });

  describe('integration with real EncodingAdapter', () => {
    let realUseCase: LoadSharedBoardUseCase;

    beforeEach(() => {
      const realEncoding = new JsonBase64EncodingAdapter();
      const realArrangement = new DeterministicArrangementEngine();
      realUseCase = new LoadSharedBoardUseCase(realEncoding, realArrangement);
    });

    it('round-trips a real encoded payload', () => {
      const adapter = new JsonBase64EncodingAdapter();
      const encoded = adapter.encode(payload);

      const result = realUseCase.execute(encoded);
      expect(result.board.words).toEqual(words);
      expect(result.topic).toBe('star wars');
      expect(result.shareSeed).toBe('share-seed');
      expect(result.arrangement).toHaveLength(5);
      expect(result.arrangement[2][2]).toBe('FREE');
    });

    it('round-trips a URL with hash fragment', () => {
      const adapter = new JsonBase64EncodingAdapter();
      const encoded = adapter.encode(payload);

      const result = realUseCase.execute(`https://example.com/#${encoded}`);
      expect(result.board.words).toEqual(words);
    });

    it('round-trips a URL with hash and slash', () => {
      const adapter = new JsonBase64EncodingAdapter();
      const encoded = adapter.encode(payload);

      const result = realUseCase.execute(`https://example.com/#/${encoded}`);
      expect(result.board.words).toEqual(words);
    });
  });
});
