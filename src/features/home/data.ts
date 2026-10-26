/**
 * Everything the home shows, picked at build time from the catalog and the
 * news (the site is rebuilt every hour, see README.md).
 */
import { getNewsArticles } from '@/features/actus/api';
import { getGames } from '@/features/jeu/api';
import { PACES, paceDays } from '@/features/jeu/components/Pace/pace';
import { getAllGenres } from '@/functions/getAllGenres';
import type { Game } from '@/types/Game';
import { genreLabels } from './genres';
import { nextMilestone, today } from './finishDate';
import { newGames } from './newGames';

export interface HomeGame {
  name: string;
  slug: string;
  cover: string | null;
  // Hours, 0 when unknown
  main: number;
  plus: number;
  full: number;
}

const toHomeGame = (game: Game): HomeGame => ({
  name: game.name,
  slug: game.slug,
  cover: game.cover,
  main: game.timeMainStory,
  plus: game.timeMainExtras,
  full: game.timeCompletionists,
});

// "The Witcher 3: Wild Hunt - Game of the Year Edition" → "thewitcher3wildhunt
// gameoftheyearedition": an edition starts with the name of its game
const comparable = (name: string) =>
  name
    .normalize(`NFD`)
    .replace(/[^a-z0-9]/gi, ``)
    .toLowerCase();

// Games a list can show: a main story time and a cover of their own (some
// imported covers are shared by unrelated games), most popular first, one
// edition per game
function listableGames(games: Game[]) {
  const coverCounts = new Map<string, number>();
  for (const game of games) {
    if (game.cover)
      coverCounts.set(game.cover, (coverCounts.get(game.cover) ?? 0) + 1);
  }
  const seen: string[] = [];
  return games
    .filter(
      (game) =>
        game.timeMainStory > 0 &&
        game.cover &&
        coverCounts.get(game.cover) === 1,
    )
    .sort(
      (a, b) =>
        b.popularity - a.popularity || a.name.localeCompare(b.name, `fr`),
    )
    .filter((game) => {
      const name = comparable(game.name);
      if (
        seen.some((other) => name.startsWith(other) || other.startsWith(name))
      )
        return false;
      seen.push(name);
      return true;
    });
}

// "Before Christmas": at each pace, the longest of the popular games that
// can still be finished before the milestone, shortest first
const FINISHABLE_POOL = 150;
const FINISHABLE_COUNT = 8;

function finishableLists(games: Game[], milestoneDays: number) {
  const pool = games.slice(0, FINISHABLE_POOL);
  return Object.fromEntries(
    PACES.map((pace) => [
      pace,
      pool
        .filter((game) => paceDays(game.timeMainStory, pace) <= milestoneDays)
        .sort((a, b) => b.timeMainStory - a.timeMainStory)
        .slice(0, FINISHABLE_COUNT)
        .sort(
          (a, b) =>
            a.timeMainStory - b.timeMainStory || b.popularity - a.popularity,
        )
        .map(toHomeGame),
    ]),
  ) as Record<number, HomeGame[]>;
}

// "La règle": the most popular games on one hours axis. Each cover takes the
// lane closest to the axis where it does not cover another one (1 above,
// -1 below, 2 above…), the most popular games first
const RULER_COUNT = 48;
// Width of a cover, in percent of the axis
const RULER_CHIP = 3.7;

export interface RulerGame extends HomeGame {
  // Position on the axis, in percent
  x: number;
  lane: number;
}

function ruler(games: Game[]) {
  const picked = games.slice(0, RULER_COUNT);
  const max = Math.ceil(Math.max(...picked.map((g) => g.timeMainStory)) / 10);
  const axisMax = max * 10;
  const lanes = new Map<number, number[]>();
  const placed: RulerGame[] = picked.map((game) => {
    const x = (game.timeMainStory / axisMax) * 100;
    for (let step = 1; ; step += 1) {
      const lane = step % 2 ? (step + 1) / 2 : -step / 2;
      const taken = lanes.get(lane) ?? [];
      if (taken.every((other) => Math.abs(other - x) >= RULER_CHIP)) {
        lanes.set(lane, [...taken, x]);
        return { ...toHomeGame(game), x, lane };
      }
    }
  });
  const times = picked.map((g) => g.timeMainStory).sort((a, b) => a - b);
  const middle = times.length >> 1;
  const median =
    times.length % 2
      ? times[middle]
      : Math.round((times[middle - 1] + times[middle]) / 2);
  return {
    // Along the axis: the reading and tab order
    games: placed.sort((a, b) => a.x - b.x || a.lane - b.lane),
    axisMax,
    median,
    lanesAbove: Math.max(...placed.map((g) => g.lane)),
    lanesBelow: -Math.min(...placed.map((g) => g.lane)),
  };
}

// Genres by length: main story distribution of their games
export const GENRE_BINS = [
  { max: 5, label: `moins de 5 h` },
  { max: 10, label: `5 à 10 h` },
  { max: 20, label: `10 à 20 h` },
  { max: 40, label: `20 à 40 h` },
  { max: 80, label: `40 à 80 h` },
  { max: Infinity, label: `plus de 80 h` },
];
export const GENRE_MIN_TIMES = 10;

export async function genreStats(games: Game[]) {
  const genres = await getAllGenres();
  const stats = genres.map((genre) => {
    const inGenre = games.filter((game) => game.genreIds.includes(genre.id));
    const times = inGenre
      .map((game) => game.timeMainStory)
      .filter((time) => time > 0)
      .sort((a, b) => a - b);
    const bins = GENRE_BINS.map(
      (bin, index) =>
        times.filter(
          (time) =>
            time <= bin.max &&
            (index === 0 || time > GENRE_BINS[index - 1].max),
        ).length,
    );
    return {
      slug: genre.slug,
      label: genreLabels[genre.slug] ?? genre.name,
      count: inGenre.length,
      timed: times.length,
      median: times.length ? times[times.length >> 1] : 0,
      bins,
    };
  });
  // Two imported genres share a name: keep the one with games
  const byLabel = new Map<string, (typeof stats)[number]>();
  for (const genre of stats) {
    const other = byLabel.get(genre.label);
    if (genre.count > 0 && (!other || genre.count > other.count))
      byLabel.set(genre.label, genre);
  }
  const all = [...byLabel.values()].sort((a, b) => b.count - a.count);
  return {
    charted: all.filter((genre) => genre.timed >= GENRE_MIN_TIMES),
    others: all.filter((genre) => genre.timed < GENRE_MIN_TIMES),
  };
}

// Game of the hero: the game the latest news talk about the most, else the
// most popular one
const HERO_NEWS_DAYS = 14;

async function homeData() {
  const [games, news] = await Promise.all([getGames(), getNewsArticles()]);
  const builtAt = new Date();
  const day = today(`Europe/Paris`, builtAt);
  const listable = listableGames(games);
  const bySlug = new Map(games.map((game) => [game.slug, game]));

  const mentions = new Map<string, number>();
  for (const article of news) {
    const age = builtAt.getTime() - new Date(article.date).getTime();
    if (!article.game || age > HERO_NEWS_DAYS * 86_400_000) continue;
    mentions.set(article.game.slug, (mentions.get(article.game.slug) ?? 0) + 1);
  }
  const inNews = listable
    .filter((game) => mentions.has(game.slug))
    .sort((a, b) => mentions.get(b.slug)! - mentions.get(a.slug)!);
  const hero = inNews[0] ?? listable[0];

  // "Four questions": a game with all the answers, the hero's when it can
  const complete = (game: Game) =>
    game.timeMainStory >= 10 &&
    game.completion !== null &&
    (game.price?.current ?? 0) > 0;
  const example = complete(hero) ? hero : listable.find(complete);

  const milestone = nextMilestone(day);

  return {
    builtAt,
    day,
    gamesCount: games.length,
    hero: toHomeGame(hero),
    example: example && {
      ...toHomeGame(example),
      completion: example.completion!.percent,
      price: example.price!,
    },
    milestone,
    finishable: finishableLists(listable, milestone.days),
    ruler: ruler(listable),
    newGames: newGames(listable, builtAt).map((game) => ({
      ...toHomeGame(game),
      publishedAt: game.publishedAt!,
    })),
    news: news.slice(0, 6).map((article) => {
      const game = article.game && bySlug.get(article.game.slug);
      return { ...article, game: game ? toHomeGame(game) : null };
    }),
    genres: await genreStats(games),
  };
}

let homePromise: ReturnType<typeof homeData> | undefined;

export function getHomeData() {
  homePromise ??= homeData();
  return homePromise;
}

export type HomeData = Awaited<ReturnType<typeof homeData>>;
