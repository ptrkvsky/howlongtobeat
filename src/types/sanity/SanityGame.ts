import { SanitySlug } from './SanitySlug';

export interface SanityGame {
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: string;
  _updatedAt: string;
  cover?: string | null;
  description: any;
  genres: any;
  idHltb: number;
  isTranslated: boolean;
  name: string;
  rating: number;
  slug: SanitySlug;
  timeCompletionists: number;
  timeMainExtras: number;
  timeMainStory: number;
  totalPoll: number;
}

export type SanityGameSummary = Pick<SanityGame, '_id' | 'name' | 'cover'> & {
  slug: Pick<SanitySlug, 'current'>;
};
