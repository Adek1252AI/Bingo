
import { Topic } from '../../domain/entities';

/** Shape of a word-pool JSON file. */
export interface WordPoolFile {
  name: string;
  words: string[];
}

/** Return type for listing topics. */
export interface TopicListItem {
  name: string;
  wordCount: number;
}
