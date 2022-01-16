import { SanitySlug } from './SanitySlug';

export interface SanityGenre {
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: 'genre';
  _updatedAt: string;
  description: string;
  idIgdb: number;
  name: string;
  slug: SanitySlug;
}
