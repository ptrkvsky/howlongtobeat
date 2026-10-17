import { PortableTextBlock } from '@portabletext/react';
import { SanitySlug } from './SanitySlug';

// Projection of src/features/jeu/api/getGames.ts
export interface SanityGame {
  _id: string;
  cover?: string | null;
  description: PortableTextBlock[];
  genreIds?: string[] | null;
  idHltb: number;
  name: string;
  rating: number;
  slug: SanitySlug;
  timeCompletionists: number;
  timeMainExtras: number;
  timeMainStory: number;
}

export type SanityGameSummary = Pick<SanityGame, '_id' | 'name' | 'cover'> & {
  slug: Pick<SanitySlug, 'current'>;
};
