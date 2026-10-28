import type { Component } from '../../../config/recommendations';

// What the recommendations know of a game, see scripts/recommend.ts. IGDB
// fields are empty when the IGDB match is not trusted
export interface GameFeatures {
  id: number;
  name: string;
  igdbId: number | null;
  // The base game of an edition, a remaster or an expansion
  parentIgdbId: number | null;
  // IGDB franchises and collections: "f123", "c45"
  seriesIds: string[];
  similarIgdbIds: number[];
  genres: string[];
  themes: string[];
  keywords: string[];
  gameModes: string[];
  perspectives: string[];
  // By number of votes, the most voted first
  steamTags: { name: string; votes: number }[];
  summary: string | null;
  // Hours, 0 when unknown
  timeMainStory: number;
  // HLTB players, else Steam reviews
  popularity: number;
}

export type Components = Partial<Record<Component, number>>;

export interface Recommendation {
  id: number;
  score: number;
  components: Components;
}
