import { SanitySlug } from './SanitySlug';

export interface SanityGame {
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: string;
  _updatedAt: string;
  cover: string;
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
  totalPoll: 61;
}
