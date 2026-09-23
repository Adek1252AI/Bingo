
import { Topic } from '../../domain/entities';

/**
 * Abstraction over word-pool storage.
 * Implementations can be static (JSON files), dynamic (API), or hybrid.
 */
export interface WordPoolRepository {
  /** Return a topic by name (case-insensitive match). */
  getTopic(name: string): Topic;

  /** Return all available topics. */
  listTopics(): Topic[];

  /** Check whether a topic with the given name exists. */
  hasTopic(name: string): boolean;
}
