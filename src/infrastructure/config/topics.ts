/** Builds the topic catalog from bundled word-pool JSON files. */
import { StaticWordPoolRepository } from '../wordPool/StaticWordPoolRepository';
import { Topic } from '../../domain/entities';

export function buildTopicCatalog(): Topic[] {
  const repo = new StaticWordPoolRepository();
  return repo.listTopics();
}
