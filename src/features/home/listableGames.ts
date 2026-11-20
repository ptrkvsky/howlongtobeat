import type { Game } from '@/types/Game';

// Keep word boundaries so numbered sequels (GTA V / VI, F1 22 / 23)
// stay distinct while editions still start with the name of their game.
const comparable = (name: string) =>
  name
    .normalize(`NFD`)
    .replace(/\p{M}/gu, ``)
    .replace(/[^a-z0-9]+/gi, ` `)
    .trim()
    .toLowerCase();

// Games a list can show: a main story time and a cover of their own (some
// imported covers are shared by unrelated games), most popular first, one
// edition per game
export function listableGames<
  T extends Pick<Game, `name` | `cover` | `timeMainStory` | `popularity`>,
>(games: T[]) {
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
        seen.some(
          (other) =>
            name === other ||
            name.startsWith(`${other} `) ||
            other.startsWith(`${name} `),
        )
      )
        return false;
      seen.push(name);
      return true;
    });
}
