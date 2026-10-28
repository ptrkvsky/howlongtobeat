/**
 * Name match on IGDB (Twitch app token), Steam app id from external_games.
 * Only exact matches on the normalized name are kept: unlike the old scraper,
 * the first search result is never used as a fallback.
 */
import { fetchJson } from './http';

const STEAM_SOURCE = 1; // external_game_source (same value as the deprecated category)
// game_type: main game, standalone expansion, remake, remaster, expanded game.
// Leaves out DLCs, bundles (GOTY editions), packs and ports (same name).
const FULL_GAMES = `(0,4,8,9,10)`;

// HLTB suffixes that IGDB files under the base game: "(2013)", "GOTY"
const YEAR_SUFFIX = /\s*\((\d{4})\)\s*$/;
const EDITION_SUFFIX = /\s*[-:]?\s*(goty|game of the year)( edition)?\s*$/i;
const baseName = (raw: string) =>
  raw.replace(YEAR_SUFFIX, ``).replace(EDITION_SUFFIX, ``).trim();

interface IgdbGame {
  id: number;
  name: string;
  slug: string;
  first_release_date?: number;
  total_rating_count?: number;
  external_games?: {
    uid?: string;
    external_game_source?: number;
    category?: number;
  }[];
}

export interface IgdbMatch {
  id: number;
  name: string;
  slug: string;
  year?: number;
  steam: number[];
  // Search results with the same normalized name
  candidates: number;
  // No clear winner between the candidates
  ambiguous: boolean;
}

export interface IgdbResult {
  match?: IgdbMatch;
  // Best search result when nothing matched exactly, to review the misses
  closest?: string;
}

let headers: Record<string, string> | undefined;

export async function getHeaders() {
  if (headers) return headers;
  const clientId = process.env.IGDB_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret =
    process.env.IGDB_CLIENT_SECRET || process.env.CLIENT_SECRET;
  const { access_token } = await fetchJson<{ access_token: string }>(
    `https://id.twitch.tv/oauth2/token?${new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: `client_credentials`,
    })}`,
    { method: `POST` },
  );
  headers = { 'Client-ID': clientId!, Authorization: `Bearer ${access_token}` };
  return headers;
}

export const hasIgdbCredentials = () =>
  Boolean(
    (process.env.IGDB_CLIENT_ID || process.env.CLIENT_ID) &&
    (process.env.IGDB_CLIENT_SECRET || process.env.CLIENT_SECRET),
  );

// "Tomb Raider (2013)" → { name: "tomb raider", year: 2013 }
export function normalizeName(raw: string) {
  const year = raw.match(YEAR_SUFFIX)?.[1];
  const name = baseName(raw)
    .normalize(`NFKD`)
    .replace(/[̀-ͯ]/g, ``)
    .replace(/[™®©]/g, ``)
    .replace(/&/g, ` and `)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ` `)
    .trim();
  return { name, year: year ? Number(year) : undefined };
}

const releaseYear = (game: IgdbGame) =>
  game.first_release_date
    ? new Date(game.first_release_date * 1000).getUTCFullYear()
    : undefined;

const steamIds = (game: IgdbGame) => [
  ...new Set(
    (game.external_games || [])
      .filter(
        (external) =>
          (external.external_game_source ?? external.category) === STEAM_SOURCE,
      )
      .map((external) => Number(external.uid))
      .filter((uid) => uid > 0),
  ),
];

export async function findIgdbGame(name: string): Promise<IgdbResult> {
  const target = normalizeName(name);
  const search = baseName(name).replace(/"/g, `\\"`);
  const games = await fetchJson<IgdbGame[]>(`https://api.igdb.com/v4/games`, {
    method: `POST`,
    headers: await getHeaders(),
    body: `search "${search}"; fields name, slug, first_release_date, total_rating_count, external_games.uid, external_games.external_game_source, external_games.category; where game_type = ${FULL_GAMES}; limit 50;`,
  });

  let candidates = games.filter(
    (game) => normalizeName(game.name).name === target.name,
  );
  if (!candidates.length) return { closest: games[0]?.name };

  // A year in the HLTB name ("Tomb Raider (2013)") picks the right edition
  if (target.year && candidates.length > 1) {
    const sameYear = candidates.filter(
      (game) => releaseYear(game) === target.year,
    );
    if (sameYear.length) candidates = sameYear;
  }

  candidates.sort(
    (a, b) => (b.total_rating_count ?? 0) - (a.total_rating_count ?? 0),
  );
  const [best, second] = candidates;
  // Same name: ambiguous unless the best one is clearly more popular
  const ambiguous =
    Boolean(second) &&
    (second.total_rating_count ?? 0) >= (best.total_rating_count ?? 0) * 0.25;

  return {
    match: {
      id: best.id,
      name: best.name,
      slug: best.slug,
      year: releaseYear(best),
      steam: steamIds(best),
      candidates: candidates.length,
      ambiguous,
    },
  };
}

const igdbQuery = async <T>(body: string) =>
  fetchJson<T>(`https://api.igdb.com/v4/games`, {
    method: `POST`,
    headers: await getHeaders(),
    body,
  });

// Wikidata only gives IGDB slugs: their ids, in batches of 500
export async function getIgdbIdsBySlug(slugs: string[]) {
  const ids = new Map<string, number>();
  for (let i = 0; i < slugs.length; i += 500) {
    const chunk = slugs.slice(i, i + 500);
    const games = await igdbQuery<{ id: number; slug: string }[]>(
      `fields slug; where slug = (${chunk.map((slug) => `"${slug.replace(/"/g, ``)}"`).join(`,`)}); limit 500;`,
    );
    for (const game of games) ids.set(game.slug, game.id);
  }
  return ids;
}

export interface IgdbDetails {
  id: number;
  firstReleaseDate: string | null;
  developers: string[];
  publishers: string[];
  // IGDB platform slugs, mapped to labels by src/config/platforms.ts
  platformSlugs: string[];
  isMature: boolean;
  summary: string | null;
  coverImageId: string | null;
  // Same names as the site genres (the catalog was built from IGDB genres)
  genres: string[];
  // Gameplay fields, for the recommendations
  themes: string[];
  keywords: string[];
  gameModes: string[];
  perspectives: string[];
  franchiseIds: number[];
  collectionIds: number[];
  // The base game of an edition, a remaster or an expansion
  parentIgdbId: number | null;
  similarIgdbIds: number[];
}

interface IgdbDetailsRow {
  id: number;
  first_release_date?: number;
  summary?: string;
  cover?: { image_id: string };
  genres?: { name: string }[];
  themes?: { name: string }[];
  keywords?: { name: string }[];
  game_modes?: { name: string }[];
  player_perspectives?: { name: string }[];
  franchise?: number;
  franchises?: number[];
  collections?: number[];
  version_parent?: number;
  parent_game?: number;
  similar_games?: number[];
  platforms?: { slug: string }[];
  involved_companies?: {
    company?: { name: string };
    developer?: boolean;
    publisher?: boolean;
  }[];
  age_ratings?: {
    organization?: { name: string };
    rating_category?: { rating: string };
    // Deprecated enums, still filled on older entries
    category?: number;
    rating?: number;
  }[];
}

// PEGI 18, ESRB Mature or Adults Only
const isMatureRating = (
  rating: NonNullable<IgdbDetailsRow[`age_ratings`]>[number],
) => {
  const organization = rating.organization?.name.toUpperCase();
  const value = rating.rating_category?.rating.toUpperCase();
  if (organization && value) {
    return (
      (organization === `PEGI` && [`18`, `EIGHTEEN`].includes(value)) ||
      (organization === `ESRB` && [`M`, `AO`].includes(value))
    );
  }
  // Deprecated: category 1 ESRB / 2 PEGI, rating 5 PEGI 18, 11 M, 12 AO
  return (
    (rating.category === 2 && rating.rating === 5) ||
    (rating.category === 1 && [11, 12].includes(rating.rating ?? 0))
  );
};

const unique = <T>(values: T[]) => [...new Set(values)];
const names = (values?: { name: string }[]) =>
  unique((values ?? []).map(({ name }) => name));

// IGDB keywords are free and many: the first ones are kept
const MAX_KEYWORDS = 30;

export async function getIgdbDetails(ids: number[]) {
  const details = new Map<number, IgdbDetails>();
  for (let i = 0; i < ids.length; i += 500) {
    const chunk = ids.slice(i, i + 500);
    const rows = await igdbQuery<IgdbDetailsRow[]>(
      `fields first_release_date, summary, cover.image_id, genres.name, platforms.slug, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, age_ratings.organization.name, age_ratings.rating_category.rating, age_ratings.category, age_ratings.rating, themes.name, keywords.name, game_modes.name, player_perspectives.name, franchise, franchises, collections, version_parent, parent_game, similar_games; where id = (${chunk.join(`,`)}); limit 500;`,
    );
    for (const row of rows) {
      const companies = row.involved_companies ?? [];
      const companyNames = (role: `developer` | `publisher`) =>
        unique(
          companies.flatMap((involved) =>
            involved[role] && involved.company ? [involved.company.name] : [],
          ),
        );
      details.set(row.id, {
        id: row.id,
        firstReleaseDate: row.first_release_date
          ? new Date(row.first_release_date * 1000).toISOString().slice(0, 10)
          : null,
        developers: companyNames(`developer`),
        publishers: companyNames(`publisher`),
        platformSlugs: unique((row.platforms ?? []).map(({ slug }) => slug)),
        isMature: (row.age_ratings ?? []).some(isMatureRating),
        summary: row.summary?.trim() || null,
        coverImageId: row.cover?.image_id ?? null,
        genres: names(row.genres),
        themes: names(row.themes),
        keywords: names(row.keywords).slice(0, MAX_KEYWORDS),
        gameModes: names(row.game_modes),
        perspectives: names(row.player_perspectives),
        franchiseIds: unique([
          ...(row.franchise ? [row.franchise] : []),
          ...(row.franchises ?? []),
        ]),
        collectionIds: unique(row.collections ?? []),
        parentIgdbId: row.version_parent ?? row.parent_game ?? null,
        similarIgdbIds: row.similar_games ?? [],
      });
    }
  }
  return details;
}
