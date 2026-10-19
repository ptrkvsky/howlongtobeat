/**
 * HowLongToBeat game pages: the Next.js page embeds the game record in
 * `__NEXT_DATA__`, no browser needed. Only game pages are read, never /api.
 * Times (comp_*) are in seconds.
 */
import { fetchText, HttpError } from './http';

export interface HltbGame {
  id: number;
  name: string;
  type: string;
  parent: number;
  countTotal: number;
  countComp: number;
  countBacklog: number;
  countPlaying: number;
  countReview: number;
  reviewScore: number;
  compMainCount: number;
  compPlusCount: number;
  comp100Count: number;
  compAllCount: number;
  compMain: number;
  compMainMed: number;
  compPlus: number;
  comp100: number;
  steam: number;
  platforms: string;
  developer: string;
  publisher: string;
  releaseWorld: string;
}

export type HltbResult =
  | { status: `ok`; game: HltbGame }
  // 404, or a page without a game record (deleted or merged game)
  | { status: `not_found` | `empty` };

// Thrown when the page no longer has the expected shape: stop the run
export class HltbStructureError extends Error {}

const NEXT_DATA = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/;

function parseGame(html: string, id: number): HltbGame | null {
  const json = NEXT_DATA.exec(html)?.[1];
  if (!json) {
    const challenge = /just a moment|cf-chl|captcha/i.test(html);
    throw new HltbStructureError(
      `hltb ${id}: no __NEXT_DATA__${challenge ? ` (bot challenge)` : ``}`,
    );
  }
  const data = JSON.parse(json)?.props?.pageProps?.game?.data;
  if (!data) throw new HltbStructureError(`hltb ${id}: no game.data`);
  const raw = data.game?.[0] as Record<string, unknown> | undefined;
  if (!raw) return null;
  if (typeof raw.game_id !== `number` || typeof raw.count_total !== `number`) {
    throw new HltbStructureError(`hltb ${id}: unexpected game fields`);
  }
  const num = (key: string) => Number(raw[key]) || 0;
  const str = (key: string) => String(raw[key] ?? ``);
  return {
    id: num(`game_id`),
    name: str(`game_name`),
    type: str(`game_type`),
    parent: num(`game_parent`),
    countTotal: num(`count_total`),
    countComp: num(`count_comp`),
    countBacklog: num(`count_backlog`),
    countPlaying: num(`count_playing`),
    countReview: num(`count_review`),
    reviewScore: num(`review_score`),
    compMainCount: num(`comp_main_count`),
    compPlusCount: num(`comp_plus_count`),
    comp100Count: num(`comp_100_count`),
    compAllCount: num(`comp_all_count`),
    compMain: num(`comp_main`),
    compMainMed: num(`comp_main_med`),
    compPlus: num(`comp_plus`),
    comp100: num(`comp_100`),
    steam: num(`profile_steam`),
    platforms: str(`profile_platform`),
    developer: str(`profile_dev`),
    publisher: str(`profile_pub`),
    releaseWorld: str(`release_world`),
  };
}

export async function getHltbGame(id: number): Promise<HltbResult> {
  let html: string;
  try {
    html = await fetchText(`https://howlongtobeat.com/game/${id}`, {
      headers: { Accept: `text/html` },
    });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return { status: `not_found` };
    }
    throw error;
  }
  const game = parseGame(html, id);
  return game ? { status: `ok`, game } : { status: `empty` };
}

// Fails fast if the page no longer parses (The Legend of Zelda)
export async function checkHltb() {
  const result = await getHltbGame(10025);
  if (result.status !== `ok` || !result.game.name.includes(`Zelda`)) {
    throw new HltbStructureError(
      `HLTB check failed on 10025: ${result.status}`,
    );
  }
}
