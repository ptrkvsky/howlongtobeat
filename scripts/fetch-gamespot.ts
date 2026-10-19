/**
 * POC: translates the 5 latest GameSpot news to French with the OpenAI API and
 * publishes them on Vercel Blob, read client-side by /actus (list) and
 * /actus/article (detail). Run at 6:00, 11:30 and 17:30 (Paris time) by
 * .github/workflows/gamespot-news.yml.
 *
 *   pnpm tsx scripts/fetch-gamespot.ts           only inside a slot
 *   pnpm tsx scripts/fetch-gamespot.ts --force   any time
 *   pnpm tsx scripts/fetch-gamespot.ts --dry-run translate, print, no upload
 *
 * Only the articles missing from the published index are translated: each
 * article is translated once, its file stays on Blob afterwards.
 *
 * Env (read from .env.local when present): OPENAI_API_KEY, OPENAI_MODEL
 * (default gpt-6-luna), BLOB_READ_WRITE_TOKEN (not needed with --dry-run).
 */
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { list, put } from '@vercel/blob';
import { XMLParser } from 'fast-xml-parser';
import { Marked } from 'marked';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import OpenAI from 'openai';
import {
  NEWS_ARTICLES_PREFIX,
  NEWS_INDEX_PATH,
  newsArticlePath,
  type NewsArticle,
  type NewsIndex,
  type NewsSummary,
} from '../src/config/news';
import { slugify } from '../src/utils/slugify';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const FEED_URL = `https://www.gamespot.com/feeds/news`;
const ARTICLE_COUNT = 5;
const DEFAULT_MODEL = `gpt-6-luna`;
const SLUG_LENGTH = 80;

// Paris times of the refreshes. The workflow runs twice per slot (UTC+1 and
// UTC+2) and GitHub can start a run late: a run counts for a slot if it starts
// less than SLOT_WINDOW minutes after it.
const SLOTS = [`06:00`, `11:30`, `17:30`];
const SLOT_WINDOW = 55;

const PROMPT = `Tu traduis en français (France) un article d'actualité jeux vidéo de GameSpot écrit en anglais, au format Markdown, pour un site francophone.
- title : traduction fidèle et naturelle du titre, sans majuscule à chaque mot (règles typographiques françaises).
- excerpt : chapô de 1 ou 2 phrases (220 caractères maximum) qui résume fidèlement l'article, sans rien inventer, terminé par une ponctuation finale.
- content : traduction intégrale de l'article, fidèle et naturelle, sans rien résumer, ajouter ni retirer. Conserve exactement la structure Markdown (paragraphes, intertitres, listes, gras, italique), les URL des liens et des images, et les marqueurs {{video:…}} sur leur propre ligne. Traduis les textes des liens, les textes alternatifs et les légendes.
Garde tels quels les noms de jeux, de personnes, de studios et de plateformes.
Réponds uniquement avec le JSON demandé.`;

const RESPONSE_FORMAT = {
  type: `json_schema` as const,
  json_schema: {
    name: `article`,
    strict: true,
    schema: {
      type: `object`,
      additionalProperties: false,
      required: [`title`, `excerpt`, `content`],
      properties: {
        title: { type: `string` },
        excerpt: { type: `string` },
        content: { type: `string` },
      },
    },
  },
};

interface RssItem {
  title: string;
  link: string;
  guid: string | { '#text': string };
  pubDate: string;
  description?: string;
  'media:content'?: { '@_url': string } | { '@_url': string }[];
}

// English article, before translation
interface SourceArticle {
  id: string;
  url: string;
  date: string;
  image: string | null;
  title: string;
  markdown: string;
}

// Raw HTML is dropped: the content comes from a third-party feed and a model,
// and the page injects it as HTML
const markdownRenderer = new Marked({ renderer: { html: () => `` } });

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

function image(item: RssItem): string | null {
  const media = item[`media:content`];
  const url = Array.isArray(media) ? media[0]?.[`@_url`] : media?.[`@_url`];
  // The feed gives 300px wide thumbnails, the pages need more
  return url ? url.replace(/\?w=\d+$/, `?w=1280`) : null;
}

// The feed embeds the YouTube videos as a bare URL line, whose "_" the
// conversion escapes. They become {{video:ID}} markers, that the model keeps
// more reliably than a bare URL
function toMarkdown(html: string): string {
  return NodeHtmlMarkdown.translate(html).replace(
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w\\-]+)\S*\s*$/gm,
    (_, id: string) => `{{video:${id.replace(/\\/g, ``)}}}`,
  );
}

const VIDEO_MARKER = /\{\{video:([\w-]+)\}\}/g;

const youtubeEmbed = (id: string) =>
  `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Vidéo YouTube" loading="lazy" allowfullscreen></iframe>`;

// Videos and images of a Markdown text, to check the translation kept them
const embeds = (markdown: string) =>
  [
    ...markdown.matchAll(VIDEO_MARKER),
    ...markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g),
  ]
    .map((match) => match[1])
    .sort()
    .join(` `);

async function fetchArticles(): Promise<SourceArticle[]> {
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

  // The feed is not strictly sorted by date
  return items
    .toSorted((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate))
    .slice(0, ARTICLE_COUNT)
    .map((item) => ({
      id: String(
        typeof item.guid === `object` ? item.guid[`#text`] : item.guid,
      ),
      url: item.link,
      date: new Date(item.pubDate).toISOString(),
      image: image(item),
      title: decodeEntities(String(item.title)),
      markdown: toMarkdown(item.description ?? ``),
    }));
}

// Articles already translated, by URL. Read with the Blob API, not from the
// CDN that can serve an outdated index. The slug ends with the GameSpot id
async function fetchTranslated(
  sources: SourceArticle[],
): Promise<Map<string, NewsSummary>> {
  const blobs = new Map<string, { url: string; uploadedAt: Date }>();
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: NEWS_ARTICLES_PREFIX, cursor });
    for (const blob of page.blobs) {
      const id = blob.pathname.match(/-(\d+)\.json$/)?.[1];
      // Several files for an id: the latest one
      if (!id) continue;
      const previous = blobs.get(id);
      if (!previous || previous.uploadedAt < blob.uploadedAt) {
        blobs.set(id, blob);
      }
    }
    cursor = page.cursor;
  } while (cursor);

  const translated = new Map<string, NewsSummary>();
  await Promise.all(
    sources.map(async (source) => {
      const url = blobs.get(source.id)?.url;
      if (!url) return;
      // An article file is never rewritten, the CDN copy is up to date. The
      // listing can lag behind a deletion: the article is translated again
      const response = await fetch(url);
      if (!response.ok) return;
      const { slug, date, image, title, excerpt }: NewsArticle =
        await response.json();
      translated.set(source.url, {
        slug,
        url: source.url,
        date,
        image,
        title,
        excerpt,
      });
    }),
  );
  return translated;
}

// French title cut between two words, then the GameSpot id that keeps the
// slug unique
function articleSlug(title: string, id: string): string {
  const words = slugify(
    // "d’une" -> "d-une", not "dune"
    title.normalize(`NFD`).replace(/\p{M}/gu, ``).replace(/['’]/g, ` `),
  )
    .split(`-`)
    .filter(Boolean);
  let slug = ``;
  for (const word of words) {
    if (slug.length + word.length > SLUG_LENGTH) break;
    slug += `${word}-`;
  }
  return `${slug}${id}`;
}

async function translate(
  openai: OpenAI,
  model: string,
  source: SourceArticle,
): Promise<NewsArticle> {
  const completion = await openai.chat.completions.create({
    model,
    response_format: RESPONSE_FORMAT,
    messages: [
      { role: `developer`, content: PROMPT },
      {
        role: `user`,
        content: JSON.stringify({
          title: source.title,
          content: source.markdown,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message.content;
  if (!content) throw new Error(`Empty response from ${model}`);
  const translation = JSON.parse(content) as {
    title: string;
    excerpt: string;
    content: string;
  };
  const title = translation.title.trim();
  const excerpt = translation.excerpt.trim();
  const markdown = translation.content.trim();
  // A much shorter text is a summary or a cut answer, not a translation
  const ratio = markdown.length / Math.max(1, source.markdown.length);
  if (!title || !excerpt || ratio < 0.7) {
    throw new Error(`Incomplete translation (ratio ${ratio.toFixed(2)})`);
  }
  if (embeds(markdown) !== embeds(source.markdown)) {
    throw new Error(`Videos or images lost in the translation`);
  }
  console.log(
    `  ${source.url}: ${completion.usage?.prompt_tokens} input + ${completion.usage?.completion_tokens} output tokens`,
  );

  // The model can glue a marker to the next line: one paragraph per video
  const separated = markdown.replace(
    /[^\S\n]*\{\{video:([\w-]+)\}\}[^\S\n]*/g,
    `\n\n{{video:$1}}\n\n`,
  );
  const html = (markdownRenderer.parse(separated, { async: false }) as string)
    .replace(/<a /g, `<a target="_blank" rel="noopener nofollow" `)
    .replace(/<img /g, `<img loading="lazy" `)
    .replace(/<p>\s*\{\{video:([\w-]+)\}\}\s*<\/p>/g, (_, id: string) =>
      youtubeEmbed(id),
    );
  return {
    slug: articleSlug(title, source.id),
    url: source.url,
    date: source.date,
    image: source.image,
    title,
    excerpt,
    content: html,
  };
}

async function upload(path: string, data: unknown) {
  return put(path, JSON.stringify(data), {
    access: `public`,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: `application/json`,
  });
}

async function main() {
  const { values } = parseArgs({
    options: {
      force: { type: `boolean`, default: false },
      'dry-run': { type: `boolean`, default: false },
    },
  });
  const dryRun = values[`dry-run`];

  const slot = currentSlot(new Date());
  if (!values.force && !dryRun && !slot) {
    console.log(`Outside of the ${SLOTS.join(` / `)} slots (Paris), skipping.`);
    return;
  }
  if (!process.env.OPENAI_API_KEY) throw new Error(`Missing OPENAI_API_KEY`);
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const openai = new OpenAI();

  const sources = await fetchArticles();
  // Without a Blob token (--dry-run), every article is translated
  const known = process.env.BLOB_READ_WRITE_TOKEN
    ? await fetchTranslated(sources)
    : new Map<string, NewsSummary>();
  const toTranslate = sources.filter((source) => !known.has(source.url));
  console.log(
    `${sources.length} articles, ${toTranslate.length} to translate with ${model}`,
  );

  // A failed article is left out of this run, and retried by the next one
  const translated = new Map<string, NewsArticle>();
  await Promise.all(
    toTranslate.map(async (source) => {
      try {
        translated.set(source.url, await translate(openai, model, source));
      } catch (error) {
        console.error(`  ${source.url}: ${String(error)}`);
        process.exitCode = 1;
      }
    }),
  );

  const index: NewsIndex = {
    source: `GameSpot`,
    updatedAt: new Date().toISOString(),
    articles: sources.flatMap((source) => {
      const article = translated.get(source.url) ?? known.get(source.url);
      if (!article) return [];
      const { slug, url, date, image, title, excerpt } = article;
      return [{ slug, url, date, image, title, excerpt }];
    }),
  };
  if (index.articles.length === 0) throw new Error(`No article to publish`);

  if (dryRun) {
    console.log(JSON.stringify([...translated.values()], null, 2));
    console.log(JSON.stringify(index, null, 2));
    return;
  }

  // Articles first: the index never points to a missing file
  await Promise.all(
    [...translated.values()].map((article) =>
      upload(newsArticlePath(article.slug), article),
    ),
  );
  const blob = await upload(NEWS_INDEX_PATH, index);
  console.log(
    `${index.articles.length} articles published (${translated.size} new)${slot ? ` for the ${slot} slot` : ``}: ${blob.url}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
