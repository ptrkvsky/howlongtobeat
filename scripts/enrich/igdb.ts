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

async function getHeaders() {
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
