/**
 * Main image of a news article, never the source's: an IGDB artwork or
 * screenshot of the game, its Steam library hero, else the visual of the
 * article's category (public/actus). Google Discover needs 1200px wide.
 */
import type { NewsCategory, NewsImage } from '../../src/config/news';
import { igdbImage } from '../../src/utils/igdbImage';
import { fetchJson } from '../enrich/http';
import { getHeaders, hasIgdbCredentials } from '../enrich/igdb';

const MIN_WIDTH = 1200;
// IGDB t_1080p fits the image in 1920 × 1080
const IGDB_BOX = { width: 1920, height: 1080 };

export const categoryImage = (category: NewsCategory) => ({
  url: `/actus/${category}.webp`,
  width: 1600,
  height: 900,
});

// IGDB game: its slug (catalog) or its id (search)
export type IgdbGameRef = { slug: string } | { id: number };

interface IgdbPicture {
  image_id: string;
  width?: number;
  height?: number;
}

interface IgdbPictures {
  artworks?: IgdbPicture[];
  screenshots?: IgdbPicture[];
}

function fitIgdb({ width = 0, height = 0 }: IgdbPicture) {
  const scale = Math.min(1, IGDB_BOX.width / width, IGDB_BOX.height / height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

// Widest picture close to 16:9 (artworks can be banners), once resized, at
// least MIN_WIDTH wide
function widest(pictures: IgdbPicture[] = []) {
  return pictures
    .filter(({ width = 0, height = 0 }) => {
      const ratio = width / height;
      return ratio >= 1.5 && ratio <= 2;
    })
    .map((picture) => ({ picture, ...fitIgdb(picture) }))
    .filter(({ width }) => width >= MIN_WIDTH)
    .sort((a, b) => b.width - a.width)[0];
}

async function igdbPicture(game: IgdbGameRef) {
  const where =
    `slug` in game
      ? `slug = "${game.slug.replace(/"/g, ``)}"`
      : `id = ${game.id}`;
  const [row] = await fetchJson<IgdbPictures[]>(
    `https://api.igdb.com/v4/games`,
    {
      method: `POST`,
      headers: await getHeaders(),
      body: `fields artworks.image_id, artworks.width, artworks.height, screenshots.image_id, screenshots.width, screenshots.height; where ${where}; limit 1;`,
    },
  );
  const best = widest(row?.artworks) ?? widest(row?.screenshots);
  if (!best) return null;
  return {
    url: igdbImage(best.picture.image_id, `1080p`),
    width: best.width,
    height: best.height,
  };
}

// 1920 × 620, not on every game
async function steamHero(appId: number) {
  const url = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_hero.jpg`;
  const response = await fetch(url, { method: `HEAD` });
  return response.ok ? { url, width: 1920, height: 620 } : null;
}

export async function newsImage({
  igdb,
  steamAppId,
  gameName,
  category,
}: {
  igdb: IgdbGameRef | null;
  steamAppId: number | null;
  gameName: string | null;
  category: NewsCategory;
}): Promise<NewsImage> {
  const alt = gameName ? `Visuel de ${gameName}` : ``;
  try {
    const picture =
      (igdb && hasIgdbCredentials() ? await igdbPicture(igdb) : null) ??
      (steamAppId ? await steamHero(steamAppId) : null);
    if (picture) return { ...picture, alt };
  } catch (error) {
    // A missing image is no reason to lose the article
    console.error(`  image of ${gameName}: ${String(error)}`);
  }
  return { ...categoryImage(category), alt };
}
