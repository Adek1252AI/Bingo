
import { Board } from '../../domain/entities';
import { WordPoolRepository } from '../../infrastructure/wordPool/WordPoolRepository';

export class GenerateRandomBoardUseCase {
  constructor(private wordPoolRepository: WordPoolRepository) {}

  execute(topicName: string): Board {
    const topic = this.wordPoolRepository.getTopic(topicName);
    const words = this.pickRandomWords(topic.words, 24);
    return { words };
  }

  private pickRandomWords(words: string[], count: number): string[] {
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
}
