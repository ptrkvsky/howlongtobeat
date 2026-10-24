// Game as rendered by the site, see src/features/jeu/api/getGames.ts.
// Enriched blocks are null when their data is missing or not trusted.
export interface Game {
  id: number;
  hltbId: number;
  name: string;
  slug: string;
  // IGDB image id, see src/utils/igdbImage.ts
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
  hltb: GameHltb | null;
  price: GamePrice | null;
  // Main story compared with the catalog, null without time
  timeRank: GameTimeRank | null;
  // Sort key for game lists, see getGames.ts
  popularity: number;
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

// Share of the catalog (0-100) with a shorter / longer main story
export interface GameTimeRank {
  longerThan: number;
  shorterThan: number;
}

// HowLongToBeat players and submissions behind the times
export interface GameHltb {
  players: number;
  completed: number;
  playing: number;
  backlog: number;
  // Current HLTB times in hours and their submissions. The legacy games keep
  // their 2021 times: the counts only describe a time equal to these
  times: Record<'main' | 'plus' | 'full', { hours: number; count: number }>;
  // Main story median, in hours (0 when unknown)
  mainMedian: number;
  updatedAt: string;
}

// F7, from IsThereAnyDeal (France): current best price and historical low
export interface GamePrice {
  current: number;
  shop: string;
  url: string | null;
  lowest: number | null;
  lowestShop: string | null;
  currency: string;
  updatedAt: string;
}

// F6: only confirmed ids
export interface GameLinks {
  steamAppId: number | null;
  igdbSlug: string | null;
}

export type GameSummary = Pick<Game, 'id' | 'name' | 'cover' | 'slug'>;

// A related game of a game page, drawn on the same hour scale
export type RelatedGame = GameSummary &
  Pick<Game, 'timeMainStory' | 'timeMainExtras' | 'timeCompletionists'>;
