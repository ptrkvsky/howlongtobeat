/**
 * Matches a recent Wikidata game (no HowLongToBeat id yet) with the HLTB pages
 * read by scripts/enrich/hltb-scan.ts. Pure logic, no I/O: scripts/import-recent.ts
 * only inserts the `sure` matches, the others go to the review file.
 */
import type { HltbGame } from '../enrich/hltb';
import { PAGE_TYPES } from '../enrich/threshold';
import type { WikidataRecentGame } from '../enrich/wikidata';

export const normalizeName = (name: string) =>
  name
    .normalize(`NFKD`)
    .replace(/[̀-ͯ]/g, ``)
    .toLowerCase()
    .replace(/&/g, ` and `)
    .replace(/[^a-z0-9]+/g, ` `)
    .trim();

export type Match =
  | { kind: `sure`; reason: `steam` | `name+date`; hltb: HltbGame }
  | { kind: `uncertain`; reason: string; hltb: HltbGame[] }
  | { kind: `none` };

const month = (date: string) => date.slice(0, 7);

// HLTB `releaseWorld` is a YYYY-MM-DD string, with 00 for an unknown part
const sameMonth = (hltb: HltbGame, wikidata: WikidataRecentGame) =>
  /^\d{4}-\d{2}/.test(hltb.releaseWorld) &&
  month(hltb.releaseWorld) === month(wikidata.date);

// DLC, mods and compilations share the Steam id or the name of the game
const isGamePage = (hltb: HltbGame) => PAGE_TYPES.has(hltb.type);

export function matchRecent(
  wikidata: WikidataRecentGame,
  pages: readonly HltbGame[],
): Match {
  const games = pages.filter(isGamePage);

  // 1. Same Steam app id: the only match that needs nothing else
  if (wikidata.steam) {
    const bySteam = games.filter((hltb) => hltb.steam === wikidata.steam);
    if (bySteam.length === 1) {
      return { kind: `sure`, reason: `steam`, hltb: bySteam[0] };
    }
    if (bySteam.length > 1) {
      return {
        kind: `uncertain`,
        reason: `${bySteam.length} HLTB pages share the Steam id`,
        hltb: bySteam,
      };
    }
  }

  // 2. Same name: the release month tells a game from its remake or sequel.
  // A different Steam id on both sides is another game, whatever the name
  if (!wikidata.label) return { kind: `none` };
  const wanted = normalizeName(wikidata.label);
  const byName = games.filter(
    (hltb) =>
      normalizeName(hltb.name) === wanted &&
      !(wikidata.steam && hltb.steam && hltb.steam !== wikidata.steam),
  );
  if (byName.length === 0) return { kind: `none` };
  const sure = byName.filter((hltb) => sameMonth(hltb, wikidata));
  if (sure.length === 1) {
    return { kind: `sure`, reason: `name+date`, hltb: sure[0] };
  }
  return {
    kind: `uncertain`,
    reason:
      sure.length > 1
        ? `${sure.length} HLTB pages with this name and month`
        : `same name, release month differs (${byName.map((h) => h.releaseWorld || `?`).join(`, `)})`,
    hltb: byName,
  };
}
