import type { APIRoute } from 'astro';
import { getGames } from '@/features/jeu/api';
import { slugify } from '@/utils/slugify';

// Search index of the home, fetched on the first focus of its search field
// (src/features/home/scripts/search.ts): the games with a time, most popular
// first, as [name, main story, + extras, 100 %] in hours, then the slug when
// it is not slugify(name) (a third of the weight otherwise)
export const GET: APIRoute = async () => {
  const games = (await getGames())
    .filter(
      (game) =>
        game.timeMainStory > 0 ||
        game.timeMainExtras > 0 ||
        game.timeCompletionists > 0,
    )
    .sort(
      (a, b) =>
        b.popularity - a.popularity || a.name.localeCompare(b.name, `fr`),
    );

  return new Response(
    JSON.stringify(
      games.map((game) => [
        game.name,
        game.timeMainStory,
        game.timeMainExtras,
        game.timeCompletionists,
        ...(slugify(game.name) === game.slug ? [] : [game.slug]),
      ]),
    ),
    { headers: { 'Content-Type': `application/json` } },
  );
};
