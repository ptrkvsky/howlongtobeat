// Game as rendered by the site, see src/features/jeu/api/getGames.ts
export interface Game {
  id: number;
  hltbId: number;
  name: string;
  slug: string;
  cover: string | null;
  rating: number | null;
  timeMainStory: number;
  timeMainExtras: number;
  timeCompletionists: number;
  descriptionMd: string;
  genreIds: number[];
}

export type GameSummary = Pick<Game, 'id' | 'name' | 'cover' | 'slug'>;
