/**
 * Cross-checks the ids found by Wikidata (exact match on the HLTB id) and by
 * an IGDB name search. Data is only published from agreeing ids: any
 * disagreement gives `conflict`, left for review.
 */
import type { IgdbResult } from './igdb';
import type { WikidataIds } from './wikidata';

export type Status =
  `matched` | `conflict` | `ambiguous` | `no_steam` | `not_found`;
export type MatchSource = `both` | `wikidata` | `igdb`;

export interface ResolvedIds {
  status: Status;
  steamAppId: number | null;
  steamFrom: MatchSource | null;
  // IGDB game: the search result, or only the slug when Wikidata alone
  // knows it (the id is then looked up by slug)
  igdbId: number | null;
  igdbSlug: string | null;
  igdbFrom: MatchSource | null;
  // Wikidata IGDB slug === IGDB match slug (null when one is missing)
  igdbAgreement: boolean | null;
}

export function resolveIds(
  wikidata: WikidataIds | undefined,
  igdb: IgdbResult | undefined,
): ResolvedIds {
  const match = igdb?.match;
  const wdSteam = wikidata?.steam ?? [];
  const igdbSteam = match?.steam ?? [];
  const wdIgdb = wikidata?.igdb ?? [];
  const igdbAgreement =
    wdIgdb.length && match ? wdIgdb.includes(match.slug) : null;

  // IGDB game
  let igdbGame: Pick<ResolvedIds, `igdbId` | `igdbSlug` | `igdbFrom`> = {
    igdbId: null,
    igdbSlug: null,
    igdbFrom: null,
  };
  if (igdbAgreement) {
    igdbGame = { igdbId: match!.id, igdbSlug: match!.slug, igdbFrom: `both` };
  } else if (wdIgdb.length === 1 && !match) {
    igdbGame = { igdbId: null, igdbSlug: wdIgdb[0], igdbFrom: `wikidata` };
  } else if (!wdIgdb.length && match && !match.ambiguous) {
    igdbGame = { igdbId: match.id, igdbSlug: match.slug, igdbFrom: `igdb` };
  }

  const result = (
    status: Status,
    steamAppId: number | null = null,
    steamFrom: MatchSource | null = null,
  ): ResolvedIds => ({
    status,
    steamAppId,
    steamFrom,
    ...(status === `conflict`
      ? { igdbId: null, igdbSlug: null, igdbFrom: null }
      : igdbGame),
    igdbAgreement,
  });

  if (!wikidata && !match) return result(`not_found`);
  // Wikidata and IGDB name two different IGDB games
  if (igdbAgreement === false) return result(`conflict`);
  if (wdSteam.length && igdbSteam.length) {
    const shared = wdSteam.find((id) => igdbSteam.includes(id));
    return shared ? result(`matched`, shared, `both`) : result(`conflict`);
  }
  // Wikidata is an exact match on the HLTB id: trusted alone
  if (wdSteam.length) return result(`matched`, wdSteam[0], `wikidata`);
  if (igdbSteam.length) {
    return match!.ambiguous
      ? result(`ambiguous`)
      : result(`matched`, igdbSteam[0], `igdb`);
  }
  return !wikidata && match?.ambiguous
    ? result(`ambiguous`)
    : result(`no_steam`);
}
