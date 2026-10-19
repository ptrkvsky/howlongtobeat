/**
 * POC: publishes the 5 latest GameSpot news as a JSON file on Vercel Blob,
 * read client-side by /actus. Run at 6:00, 11:30 and 17:30 (Paris time) by
 * .github/workflows/gamespot-news.yml.
 *
 *   pnpm tsx scripts/fetch-gamespot.ts           only inside a slot
 *   pnpm tsx scripts/fetch-gamespot.ts --force   any time
 *   pnpm tsx scripts/fetch-gamespot.ts --dry-run print the JSON, no upload
 *
 * Env: BLOB_READ_WRITE_TOKEN (not needed with --dry-run).
 */
import { parseArgs } from 'node:util';
import { put } from '@vercel/blob';
import { XMLParser } from 'fast-xml-parser';

const FEED_URL = `https://www.gamespot.com/feeds/news`;
const BLOB_PATH = `news/gamespot.json`;
const ARTICLE_COUNT = 5;
const EXCERPT_LENGTH = 200;

// Paris times of the refreshes. The workflow runs twice per slot (UTC+1 and
// UTC+2) and GitHub can start a run late: a run counts for a slot if it starts
// less than SLOT_WINDOW minutes after it.
const SLOTS = [`06:00`, `11:30`, `17:30`];
const SLOT_WINDOW = 55;

export interface NewsArticle {
  title: string;
  url: string;
  date: string;
  image: string | null;
  excerpt: string;
}

export interface NewsFeed {
  source: string;
  updatedAt: string;
  articles: NewsArticle[];
}

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  'media:content'?: { '@_url': string } | { '@_url': string }[];
}

function parisMinutes(date: Date): number {
  const [hours, minutes] = new Intl.DateTimeFormat(`fr-FR`, {
    timeZone: `Europe/Paris`,
    hour: `2-digit`,
    minute: `2-digit`,
    hourCycle: `h23`,
  })
    .format(date)
    .split(`:`)
    .map(Number);
  return hours * 60 + minutes;
}

function currentSlot(date: Date): string | undefined {
  const now = parisMinutes(date);
  return SLOTS.find((slot) => {
    const [hours, minutes] = slot.split(`:`).map(Number);
    const delay = now - (hours * 60 + minutes);
    return delay >= 0 && delay < SLOT_WINDOW;
  });
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replace(/&quot;/g, `"`)
    .replace(/&apos;/g, `'`)
    .replace(/&lt;/g, `<`)
    .replace(/&gt;/g, `>`)
    .replace(/&nbsp;/g, ` `)
    .replace(/&amp;/g, `&`);
}

function excerpt(html = ``): string {
  const text = decodeEntities(html.replace(/<[^>]*>/g, ` `))
    .replace(/\s+/g, ` `)
    .trim();
  if (text.length <= EXCERPT_LENGTH) return text;
  return `${text.slice(0, text.lastIndexOf(` `, EXCERPT_LENGTH))}…`;
}

function image(item: RssItem): string | null {
  const media = item[`media:content`];
  const url = Array.isArray(media) ? media[0]?.[`@_url`] : media?.[`@_url`];
  // The feed gives 300px wide thumbnails, the cards need a bit more
  return url ? url.replace(/\?w=\d+$/, `?w=640`) : null;
}

async function fetchFeed(): Promise<NewsFeed> {
  const response = await fetch(FEED_URL, {
    headers: { 'user-agent': `game-over-news/0.1 (https://game-over.io)` },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} on ${FEED_URL}`);
  }
  const parser = new XMLParser({
    ignoreAttributes: false,
    processEntities: false,
    isArray: (name) => name === `item`,
  });
  const items: RssItem[] =
    parser.parse(await response.text()).rss?.channel?.item ?? [];
  if (items.length === 0) throw new Error(`No item in ${FEED_URL}`);

  return {
    source: `GameSpot`,
    updatedAt: new Date().toISOString(),
    // The feed is not strictly sorted by date
    articles: items
      .toSorted((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate))
      .slice(0, ARTICLE_COUNT)
      .map((item) => ({
        title: decodeEntities(String(item.title)),
        url: item.link,
        date: new Date(item.pubDate).toISOString(),
        image: image(item),
        excerpt: excerpt(item.description),
      })),
  };
}

async function main() {
  const { values } = parseArgs({
    options: {
      force: { type: `boolean`, default: false },
      'dry-run': { type: `boolean`, default: false },
    },
  });

  const slot = currentSlot(new Date());
  if (!values.force && !values[`dry-run`] && !slot) {
    console.log(`Outside of the ${SLOTS.join(` / `)} slots (Paris), skipping.`);
    return;
  }

  const feed = await fetchFeed();
  const json = JSON.stringify(feed, null, 2);
  if (values[`dry-run`]) {
    console.log(json);
    return;
  }

  const blob = await put(BLOB_PATH, json, {
    access: `public`,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: `application/json`,
  });
  console.log(
    `${feed.articles.length} articles published${slot ? ` (${slot} slot)` : ``}: ${blob.url}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
