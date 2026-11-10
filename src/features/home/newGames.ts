// "Nouveaux dans le catalogue": the games published over the last days, the
// latest publication day first, then in the order of the list they are picked
// from (most popular first). Without the day sort, a big batch published a few
// days ago would hide the games added since
export const NEW_GAMES_DAYS = 30;
export const NEW_GAMES_COUNT = 8;

export function newGames<T extends { publishedAt: string | null }>(
  games: T[],
  builtAt: Date,
) {
  const since = builtAt.getTime() - NEW_GAMES_DAYS * 86_400_000;
  const day = (game: T) => game.publishedAt!.slice(0, 10);
  return games
    .filter(
      (game) =>
        game.publishedAt !== null &&
        new Date(game.publishedAt).getTime() >= since,
    )
    .sort((a, b) => day(b).localeCompare(day(a)))
    .slice(0, NEW_GAMES_COUNT);
}
