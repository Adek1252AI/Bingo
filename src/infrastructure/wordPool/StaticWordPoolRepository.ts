import { Topic } from '../../domain/entities';
import { WordPoolRepository } from './WordPoolRepository';
import { wordPools } from '../../word-pools';

export class StaticWordPoolRepository implements WordPoolRepository {

  getTopic(name: string): Topic {
    const key = Object.keys(wordPools).find(
      k => k.toLowerCase() === name.toLowerCase()
    );
    if (!key) throw new Error(`Topic "${name}" not found`);
    const data = wordPools[key as keyof typeof wordPools];
    return { name: data.name, words: data.words };
  }

  listTopics(): Topic[] {
    return Object.values(wordPools).map(data => ({
      name: data.name,
      words: data.words,
    }));
  }

  hasTopic(name: string): boolean {
    return Object.keys(wordPools).some(
      k => k.toLowerCase() === name.toLowerCase()
    );
  }
}
