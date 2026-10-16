/**
 * Generates the static files that used to be served by functions:
 * - public/sitemap.xml
 * - public/search-index.json (client side search)
 *
 * Runs before `next build` (see package.json).
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const publicDir = join(process.cwd(), `public`);

async function main() {
  // Imported after the env files are loaded: the Sanity config reads them
  const { getGames, toGameSummary } = await import(`@/features/jeu/api`);
  const { getAllGenres } = await import(`@/functions/getAllGenres`);
  const { siteInformations } = await import(`@/config/siteInformations`);
  const { default: SitemapGenerator } = await import(
    `@/scripts/SitemapGenerator`
  );

  const [games, genres] = await Promise.all([getGames(), getAllGenres()]);

  const urls = [
    `${siteInformations.url}/`,
    `${siteInformations.url}/mentions-legales`,
    `${siteInformations.url}/plan-du-site`,
    `${siteInformations.url}/politique-de-confidentialite`,
    ...games.map((game) => `${siteInformations.url}/jeu/${game.slug.current}`),
    ...genres.map(
      (genre) => `${siteInformations.url}/genre/${genre.slug.current}`,
    ),
  ];

  const sitemap = new SitemapGenerator(siteInformations.url, urls).getSitemap();
  writeFileSync(join(publicDir, `sitemap.xml`), sitemap);

  const searchIndex = games.map(toGameSummary);
  writeFileSync(
    join(publicDir, `search-index.json`),
    JSON.stringify(searchIndex),
  );

  console.info(
    `✔ sitemap.xml (${urls.length} urls) and search-index.json (${searchIndex.length} games) generated`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
