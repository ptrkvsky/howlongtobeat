/**
 * "D'autres jeux à terminer": weights and filters of the recommendations
 * (src/features/jeu/recommendations, docs/recommandations.md). The weights
 * come from the evaluation (scripts/evaluate-recommendations.ts): change them
 * there first, then run scripts/recommend.ts.
 */

// Bump it when the scoring changes: the rows of an older version are ignored
export const ALGO_VERSION = `hybrid-1`;

export const RECOMMENDATION_COUNT = 12;

export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL || `text-embedding-3-small`;

// Signals of the score, each between 0 and 1
export const COMPONENTS = [
  `vector`,
  `descriptors`,
  `genres`,
  `modes`,
  `similar`,
  `time`,
  `quality`,
] as const;
export type Component = (typeof COMPONENTS)[number];
export type Weights = Record<Component, number>;

export const WEIGHTS: Weights = {
  vector: 0.35,
  descriptors: 0.35,
  genres: 0.1,
  modes: 0.05,
  similar: 0.05,
  time: 0.05,
  quality: 0.05,
};

// Under it, a game is not recommended: a shorter list rather than filler
export const MIN_SCORE = 0.3;
// Games of the same franchise or collection in a list (the reference counts)
export const MAX_PER_SERIES = 2;
// Maximal marginal relevance: 1 keeps the score order, lower diversifies
export const MMR_LAMBDA = 1;

// Steam tags and IGDB keywords that say nothing about the gameplay: business,
// reception, platform or production. Compared once normalized (descriptor())
export const IGNORED_DESCRIPTORS = [
  `indie`,
  `early access`,
  `free to play`,
  `great soundtrack`,
  `masterpiece`,
  `classic`,
  `cult classic`,
  `beautiful`,
  `addictive`,
  `funny`,
  `memes`,
  `moddable`,
  `mod support`,
  `controller`,
  `steam achievements`,
  `steam trading cards`,
  `steam workshop`,
  `steam cloud`,
  `full controller support`,
  `partial controller support`,
  `vr`,
  `remote play together`,
  `kickstarter`,
  `crowdfunded`,
  `crowdfunding kickstarter`,
  `crowdfunding`,
  `pre release public testing`,
  `software`,
  `utilities`,
  `nudity`,
  `sexual content`,
  `mature`,
  `gore`,
  `violent`,
  `female protagonist`,
  `male protagonist`,
  `singleplayer`,
  `multiplayer`,
  `online co op`,
  `local co op`,
  `co op`,
  `pvp`,
  `pve`,
  `online pvp`,
  `local multiplayer`,
  `split screen`,
  `massively multiplayer`,
  `achievements`,
  `digital distribution`,
  `steam`,
  `xbox one x enhanced`,
  `playstation trophies`,
  `xbox controller support`,
  `dualshock 4 support`,
  `2d`,
  `3d`,
  `voice acting`,
  `soundtrack`,
  `good soundtrack`,
  `episodic`,
  `remake`,
  `remaster`,
  `sequel`,
  `spiritual successor`,
  `game jam`,
  `based on a novel`,
];

// Same, for the descriptors that contain one of these words: awards, stores,
// funding ("the game awards - best art direction - nominee", "cross buy")
export const IGNORED_DESCRIPTOR_WORDS = [
  `award`,
  `awards`,
  `nominee`,
  `winner`,
  `cross buy`,
  `steam`,
  `xbox`,
  `playstation`,
  `nintendo`,
  `epic games`,
  `game pass`,
  `kickstarter`,
  `crowdfunding`,
  `dlc`,
  `trophies`,
  `achievement`,
  `achievements`,
];

// IGDB genre filed on most games, which links nothing
export const IGNORED_GENRES = [`Indie`];
