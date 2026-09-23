
/**
 * Deterministically arranges 24 words on a 5x5 grid (free center).
 * Same shareSeed + playerSeed → same arrangement.
 * Different playerSeed → different arrangement (same word set).
 */
export interface ArrangementEngine {
  arrange(words: string[], shareSeed: string, playerSeed: string): string[][];
}

export class DeterministicArrangementEngine implements ArrangementEngine {
  arrange(words: string[], shareSeed: string, playerSeed: string): string[][] {
    const grid: string[][] = Array.from({ length: 5 }, () => Array(5).fill(''));
    grid[2][2] = 'FREE'; // center is always free

    const positions = this.getPlayingPositions();
    const seed = this.hashSeed(shareSeed + '|' + playerSeed);
    const shuffled = this.seededShuffle(positions, seed);

    for (let i = 0; i < words.length && i < shuffled.length; i++) {
      const [row, col] = shuffled[i];
      grid[row][col] = words[i];
    }

    return grid;
  }

  private getPlayingPositions(): [number, number][] {
    const positions: [number, number][] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r !== 2 || c !== 2) positions.push([r, c]);
      }
    }
    return positions;
  }

  private hashSeed(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private seededShuffle(items: [number, number][], seed: number): [number, number][] {
    const rng = this.makeRng(seed);
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private makeRng(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }
}
