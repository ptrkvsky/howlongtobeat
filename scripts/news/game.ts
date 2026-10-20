/**
 * Game a news article is about: matched in the catalog by name (or through
 * IGDB, by its IGDB slug), for the link to its page, the facts given to the
 * writer model and the article image.
 */
import { getGames } from '../../src/features/jeu/api/getGames';
import { platformLabels } from '../../src/config/platforms';
import type { Game } from '../../src/types/Game';
import {
  findIgdbGame,
  hasIgdbCredentials,
  normalizeName,
} from '../enrich/igdb';
import type { IgdbGameRef } from './image';

export interface NewsGame {
  name: string;
  // Catalog game, null when the game has no page
  catalog: Game | null;
  igdb: IgdbGameRef | null;
  steamAppId: number | null;
}

let byName: Promise<Map<string, Game>> | undefined;
let byIgdbSlug: Promise<Map<string, Game>> | undefined;

// Same normalized name: the most popular game
function index(games: Game[], key: (game: Game) => string | null) {
  const map = new Map<string, Game>();
  for (const game of games) {
    const value = key(game);
    if (!value) continue;
    const previous = map.get(value);
    if (!previous || previous.popularity < game.popularity) {
      map.set(value, game);
    }
  }
  return map;
}

const fromCatalog = (game: Game): NewsGame => ({
  name: game.name,
  catalog: game,
  igdb: game.links.igdbSlug ? { slug: game.links.igdbSlug } : null,
  steamAppId: game.links.steamAppId,
});

export async function findNewsGame(name: string): Promise<NewsGame | null> {
  if (!name.trim()) return null;
  byName ??= getGames().then((games) =>
    index(games, (game) => normalizeName(game.name).name),
  );
  const catalog = (await byName).get(normalizeName(name).name);
  if (catalog) return fromCatalog(catalog);

  if (!hasIgdbCredentials()) return null;
  const { match } = await findIgdbGame(name);
  if (!match) return null;
  byIgdbSlug ??= getGames().then((games) =>
    index(games, (game) => game.links.igdbSlug),
  );
  const bySlug = (await byIgdbSlug).get(match.slug);
  if (bySlug) return fromCatalog(bySlug);
  return {
    name: match.name,
    catalog: null,
    igdb: { id: match.id },
    steamAppId: match.steam[0] ?? null,
  };
}

const hours = (value: number) => (value > 0 ? `${value} h` : undefined);

// Facts shown on the game page, given to the writer model: it may only use
// these to write about the game's length
export function gameFacts(game: Game) {
  const { identity, reviews, completion, timeRank } = game;
  const facts: Record<string, string | string[] | undefined> = {
    nom: game.name,
    dateDeSortie: identity?.releaseDate ?? undefined,
    plateformes: identity
      ? platformLabels(identity.platforms).labels
      : undefined,
    developpeurs: identity?.developers,
    editeurs: identity?.publishers,
    dureeHistoirePrincipale: hours(game.timeMainStory),
    dureeHistoireEtQuetesAnnexes: hours(game.timeMainExtras),
    dureeTout100Pourcent: hours(game.timeCompletionists),
    plusLongQue: timeRank
      ? `${timeRank.longerThan} % des jeux du catalogue (histoire principale)`
      : undefined,
    avisSteam: reviews
      ? `${reviews.percent} % d'avis positifs sur ${reviews.total} avis`
      : undefined,
    joueursSteamAyantFiniLeJeu: completion
      ? `${completion.percent} %`
      : undefined,
  };
  return Object.fromEntries(
    Object.entries(facts).filter(
      ([, value]) => value !== undefined && value.length > 0,
    ),
  );
}
