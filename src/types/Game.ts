// Game as rendered by the site, see src/features/jeu/api/getGames.ts.
// Enriched blocks are null when their data is missing or not trusted.
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
  identity: GameIdentity | null;
  reviews: GameReviews | null;
  completion: GameCompletion | null;
  links: GameLinks;
}

// F1, from IGDB
export interface GameIdentity {
  releaseDate: string | null;
  developers: string[];
  publishers: string[];
  platforms: string[];
  isMature: boolean;
}

// F2, from Steam
export interface GameReviews {
  percent: number;
  total: number;
  // French label, null for fewer than 10 reviews
  label: string | null;
  updatedAt: string;
}

// F3: share of Steam players with the end of game achievement
export interface GameCompletion {
  percent: number;
  achievement: string;
  updatedAt: string;
}

// F6: only confirmed ids
export interface GameLinks {
  steamAppId: number | null;
  igdbSlug: string | null;
}

export type GameSummary = Pick<Game, 'id' | 'name' | 'cover' | 'slug'>;
