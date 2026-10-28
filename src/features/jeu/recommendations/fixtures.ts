import type { GameFeatures } from './types';

let nextId = 1;

// A game without any data, completed by each test
export const features = (overrides: Partial<GameFeatures>): GameFeatures => ({
  id: nextId++,
  name: `Game ${nextId}`,
  igdbId: null,
  parentIgdbId: null,
  seriesIds: [],
  similarIgdbIds: [],
  genres: [],
  themes: [],
  keywords: [],
  gameModes: [],
  perspectives: [],
  steamTags: [],
  summary: null,
  timeMainStory: 0,
  popularity: 0,
  ...overrides,
});

export const tags = (...names: string[]) =>
  names.map((name, i) => ({ name, votes: 1000 - i * 50 }));
