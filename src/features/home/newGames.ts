// "Nouveaux dans le catalogue": the games published by the weekly import
// over the last days, in the order of the list they are picked from
export const NEW_GAMES_DAYS = 30;
export const NEW_GAMES_COUNT = 8;

export function newGames<T extends { publishedAt: string | null }>(
  games: T[],
  builtAt: Date,
) {
  const since = builtAt.getTime() - NEW_GAMES_DAYS * 86_400_000;
  return games
    .filter(
      (game) =>
        game.publishedAt !== null &&
        new Date(game.publishedAt).getTime() >= since,
    )
    .slice(0, NEW_GAMES_COUNT);
}
