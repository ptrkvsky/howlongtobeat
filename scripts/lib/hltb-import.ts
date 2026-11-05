/**
 * What scripts/import-games.ts and scripts/import-recent.ts share to turn an
 * HLTB page into a catalog game: conversions, names and slugs, insertion.
 */
import { getDb } from '../../src/db/client';
import { game, hltbStats } from '../../src/db/schema';
import { slugify } from '../../src/utils/slugify';
import type { HltbGame } from '../enrich/hltb';

// HLTB user score, shown as the game rating once enough players rated it
const MIN_REVIEWS_FOR_RATING = 10;

// Seconds → hours, as the legacy catalog stored them. At least 1 h when HLTB
// has a time: 0 means "no time" on the site
export const hours = (seconds: number) =>
  seconds > 0 ? Math.max(1, Math.round(seconds / 3600)) : 0;

export const ratingOf = (hltb: HltbGame) =>
  hltb.countReview >= MIN_REVIEWS_FOR_RATING ? hltb.reviewScore : null;

export const releaseDate = (hltb: HltbGame) =>
  /^\d{4}-\d{2}-\d{2}$/.test(hltb.releaseWorld) &&
  !hltb.releaseWorld.endsWith(`-00`)
    ? hltb.releaseWorld
    : null;

export const statsValues = (gameId: number, hltb: HltbGame) => ({
  gameId,
  type: hltb.type,
  countTotal: hltb.countTotal,
  countComp: hltb.countComp,
  countBacklog: hltb.countBacklog,
  countPlaying: hltb.countPlaying,
  countReview: hltb.countReview,
  reviewScore: hltb.reviewScore,
  compMainCount: hltb.compMainCount,
  compPlusCount: hltb.compPlusCount,
  comp100Count: hltb.comp100Count,
  compAllCount: hltb.compAllCount,
  compMain: hltb.compMain,
  compMainMed: hltb.compMainMed,
  compPlus: hltb.compPlus,
  comp100: hltb.comp100,
  steamAppId: hltb.steam || null,
  platforms: hltb.platforms || null,
  developer: hltb.developer || null,
  publisher: hltb.publisher || null,
  releaseWorld: hltb.releaseWorld || null,
  fetchedAt: new Date(),
});

export const upsertStats = (gameId: number, hltb: HltbGame) => {
  const { gameId: id, ...set } = statsValues(gameId, hltb);
  return getDb()
    .db.insert(hltbStats)
    .values({ gameId: id, ...set })
    .onConflictDoUpdate({ target: hltbStats.gameId, set });
};

export const csvCell = (value: unknown) => {
  const text = String(value ?? ``);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, `""`)}"` : text;
};

// A remake or a renamed sequel may share its name with a game of the
// catalog (Resident Evil 4, Overwatch): the release year tells them apart.
// The returned function remembers the names it hands out
export function createNamer(existing: { name: string; slug: string }[]) {
  const slugs = new Set(existing.map((row) => row.slug));
  const names = new Set(existing.map((row) => row.name.toLowerCase()));
  return (hltb: HltbGame) => {
    let name = hltb.name;
    const homonym = names.has(name.toLowerCase());
    const year = hltb.releaseWorld.slice(0, 4);
    if (homonym && /^\d{4}$/.test(year) && year !== `0000`) {
      name = `${name} (${year})`;
    }
    let slug = slugify(name);
    if (!slug || slugs.has(slug)) slug = `${slug || `game`}-${hltb.id}`;
    names.add(name.toLowerCase());
    names.add(hltb.name.toLowerCase());
    slugs.add(slug);
    return { name, slug, homonym };
  };
}

// Unpublished import: the enrichment, translation and publication steps of
// scripts/update-catalog.sh take it from there
export async function insertImportedGame(
  hltb: HltbGame,
  name: string,
  slug: string,
) {
  const { db } = getDb();
  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(game)
      .values({
        hltbId: hltb.id,
        name,
        slug,
        rating: ratingOf(hltb),
        timeMainStory: hours(hltb.compMain),
        timeMainExtras: hours(hltb.compPlus),
        timeCompletionists: hours(hltb.comp100),
        descriptionMd: hltb.summary,
        firstReleaseDate: releaseDate(hltb),
        source: `import`,
      })
      .returning({ id: game.id });
    await tx.insert(hltbStats).values(statsValues(row.id, hltb));
  });
}
