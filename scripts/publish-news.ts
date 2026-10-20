/**
 * Writes original French video game news from an English news feed with the
 * OpenAI API, and publishes them on Vercel Blob, read server-side by /actus
 * and /actus/[slug]. Run every hour on the VPS by
 * scripts/systemd/game-over-news.timer.
 *
 *   pnpm tsx scripts/publish-news.ts           write one article and publish
 *   pnpm tsx scripts/publish-news.ts --all     every missing latest article
 *   pnpm tsx scripts/publish-news.ts --dry-run write, print, no upload
 *   pnpm tsx scripts/publish-news.ts --purge   delete the article files the
 *                                              sitemap does not list
 *
 * The articles never name nor link the feed: they are rewritten from its
 * facts, with the catalog's data on the game, and illustrated with the game's
 * IGDB or Steam visuals (scripts/news/image.ts). Each run writes one article
 * at most, the latest one not written yet.
 *
 * Env (read from .env.local when present): OPENAI_API_KEY, OPENAI_MODEL
 * (default gpt-6-luna), BLOB_READ_WRITE_TOKEN (not needed with --dry-run),
 * DATABASE_URL, IGDB_CLIENT_ID and IGDB_CLIENT_SECRET.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { del, list, put } from '@vercel/blob';
import { XMLParser } from 'fast-xml-parser';
import { Marked } from 'marked';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import OpenAI from 'openai';
import {
  NEWS_ARTICLES_PREFIX,
  NEWS_CATEGORIES,
  NEWS_INDEX_PATH,
  NEWS_SITEMAP_PATH,
  NEWS_SITEMAP_URL,
  newsArticlePath,
  type NewsArticle,
  type NewsCategory,
  type NewsIndex,
  type NewsSitemap,
  type NewsSummary,
} from '../src/config/news';
import { closeDb } from '../src/db/client';
import { slugify } from '../src/utils/slugify';
import { findNewsGame, gameFacts } from './news/game';
import { newsImage } from './news/image';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const FEED_URL = `https://www.gamespot.com/feeds/news`;
// Articles shown on /actus, the only ones worth writing
const ARTICLE_COUNT = 5;
// Latest feed articles read, to fill /actus with already written ones
const FEED_DEPTH = 20;
// Articles written per run
const WRITES_PER_RUN = 1;
// Articles listed by the sitemap file
const SITEMAP_LENGTH = 1000;
const DEFAULT_MODEL = `gpt-6-luna`;
const SLUG_LENGTH = 80;
// Google Discover: long enough to be an article, not padded
const MIN_WORDS = 350;
const MAX_WORDS = 1000;
// Legacy files, before the rewrite: translations of the feed
const LEGACY_INDEX_PATH = `news/gamespot.json`;

const GAME_PROMPT = `Tu reçois un article d'actualité jeux vidéo en anglais. Donne le nom officiel complet du jeu principal dont parle l'article, tel qu'il est commercialisé (par exemple « Call of Duty: Modern Warfare 4 », pas « MW4 »), ou une chaîne vide si l'article ne porte pas sur un jeu précis (matériel, industrie, plusieurs jeux à égalité).`;

const WRITER_PROMPT = `Tu es journaliste pour game-over.io, un site francophone qui indique le temps nécessaire pour finir les jeux vidéo. À partir d'un article d'actualité en anglais (Markdown), tu écris un article ORIGINAL en français (France), au format Google Discover. Ce n'est pas une traduction.

Faits :
- Uniquement les faits de l'article source et de la fiche du jeu (champ "fiche", quand il est présent). Aucun fait, chiffre, date, nom ou citation inventé. En cas de doute, omets.
- N'attribue une opinion à personne (joueurs, critiques, studio) si la source ne l'attribue pas explicitement. Pas d'opinion personnelle de l'auteur source.
- Pas de révélation d'intrigue (mort d'un personnage, fin, rebondissement) : omets-la ou évoque-la sans la dévoiler.
- Ne mentionne jamais le média source, ni « un média », « nos confrères » ou « selon un article ». Aucun lien, aucune URL.
- Au plus deux citations directes, traduites, entre guillemets « ».

Forme :
- 400 à 900 mots dans "content", selon la matière disponible : développe le contexte et les enjeux présents dans la source, mais ne répète jamais une information et ne délaye pas. Markdown : paragraphes et 3 ou 4 intertitres « ## ». Pas d'intertitre de premier niveau, pas d'image.
- Pyramide inversée : l'information principale dans le premier paragraphe, puis le contexte, les détails et les enjeux. Ne suis pas l'ordre ni la structure de la source, ne traduis pas ses phrases.
- Si une fiche du jeu est fournie, termine par une section « ## Combien de temps pour finir <nom du jeu> ? » rédigée uniquement à partir de la fiche (durées, plateformes, sortie, avis Steam). Sans fiche, pas de section sur la durée de vie.
- Pas de paragraphe de conclusion qui récapitule.
- N'écris jamais « la fiche », « selon nos données » ou équivalent : présente ces informations comme des faits.
- Écris les noms de jeux avec leur casse officielle (« Call of Duty », pas « Call Of Duty »).
- Garde les marqueurs {{video:…}} de la source, chacun seul sur sa ligne, près du passage qu'il illustre (sauf une vidéo qui dévoilerait l'intrigue). N'en crée aucun.
- title : 70 caractères maximum, informatif et accrocheur sans être racoleur, sans point d'exclamation ni majuscule à chaque mot (typographie française, espace avant les deux-points).
- excerpt : chapô d'une ou deux phrases, 220 caractères maximum, qui donne l'information principale.
- category : la catégorie de l'actualité.
Garde tels quels les noms de jeux, de personnes, de studios et de plateformes.`;

const jsonSchema = (name: string, properties: Record<string, unknown>) => ({
  type: `json_schema` as const,
  json_schema: {
    name,
    strict: true,
    schema: {
      type: `object`,
      additionalProperties: false,
      required: Object.keys(properties),
      properties,
    },
  },
});

const GAME_FORMAT = jsonSchema(`game`, { game: { type: `string` } });
const WRITER_FORMAT = jsonSchema(`article`, {
  title: { type: `string` },
  excerpt: { type: `string` },
  content: { type: `string` },
  category: { type: `string`, enum: NEWS_CATEGORIES },
});

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
}

// English article from the feed
interface SourceArticle {
  // Short hash of the URL, at the end of the slug: finds the written articles
  key: string;
  url: string;
  title: string;
  markdown: string;
}

// Raw HTML, links and images are dropped: the content comes from a model, and
// the page injects it as HTML
const markdownRenderer = new Marked({
  renderer: {
    html: () => ``,
    image: () => ``,
    link({ tokens }) {
      return this.parser.parseInline(tokens);
    },
  },
});

const urlKey = (url: string) =>
  createHash(`sha1`).update(url).digest(`hex`).slice(0, 8);

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

// The feed embeds the YouTube videos as a bare URL line, whose "_" the
// conversion escapes. They become {{video:ID}} markers, that the model keeps
// more reliably than a bare URL. Images, links and other bare URLs are
// removed: the model never sees an URL
function toMarkdown(html: string): string {
  return NodeHtmlMarkdown.translate(html)
    .replace(
      /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w\\-]+)\S*\s*$/gm,
      (_, id: string) => `{{video:${id.replace(/\\/g, ``)}}}`,
    )
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ``)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, `$1`)
    .replace(/^\s*https?:\/\/\S+\s*$/gm, ``)
    .replace(/\n{3,}/g, `\n\n`)
    .trim();
}

const VIDEO_MARKER = /\{\{video:([\w-]+)\}\}/g;

const youtubeEmbed = (id: string) =>
  `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Vidéo YouTube" loading="lazy" allowfullscreen></iframe>`;

const videos = (markdown: string) =>
  new Set([...markdown.matchAll(VIDEO_MARKER)].map((match) => match[1]));

const wordCount = (markdown: string) =>
  markdown.replace(VIDEO_MARKER, ``).split(/\s+/).filter(Boolean).length;

async function fetchArticles(): Promise<SourceArticle[]> {
  const response = await fetch(FEED_URL, {
    headers: { 'user-agent': `game-over-news/0.2 (https://game-over.io)` },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} on the feed`);
  const parser = new XMLParser({
    processEntities: false,
    isArray: (name) => name === `item`,
  });
  const items: RssItem[] =
    parser.parse(await response.text()).rss?.channel?.item ?? [];
  if (items.length === 0) throw new Error(`No item in the feed`);

  // The feed is not strictly sorted by date
  return items
    .toSorted((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate))
    .slice(0, FEED_DEPTH)
    .map((item) => ({
      key: urlKey(item.link),
      url: item.link,
      title: decodeEntities(String(item.title)),
      markdown: toMarkdown(item.description ?? ``),
    }));
}

function toSummary(article: NewsArticle): NewsSummary {
  const { slug, date, category, image, title, excerpt, game } = article;
  return { slug, date, category, image, title, excerpt, game };
}

// Articles already written, by key. Read with the Blob API, not from the CDN
// that can serve an outdated index
async function fetchWritten(
  sources: SourceArticle[],
): Promise<Map<string, NewsSummary>> {
  const blobs = new Map<string, { url: string; uploadedAt: Date }>();
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: NEWS_ARTICLES_PREFIX, cursor });
    for (const blob of page.blobs) {
      const key = blob.pathname.match(/-([0-9a-f]{8})\.json$/)?.[1];
      // Several files for a key: the latest one
      if (!key) continue;
      const previous = blobs.get(key);
      if (!previous || previous.uploadedAt < blob.uploadedAt) {
        blobs.set(key, blob);
      }
    }
    cursor = page.cursor;
  } while (cursor);

  const written = new Map<string, NewsSummary>();
  await Promise.all(
    sources.map(async (source) => {
      const url = blobs.get(source.key)?.url;
      if (!url) return;
      // An article file is never rewritten, the CDN copy is up to date. The
      // listing can lag behind a deletion: the article is written again
      const response = await fetch(url);
      if (!response.ok) return;
      written.set(source.key, toSummary(await response.json()));
    }),
  );
  return written;
}

// French title cut between two words, then the key that keeps it unique
function articleSlug(title: string, key: string): string {
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
  return `${slug}${key}`;
}

async function complete<T>(
  openai: OpenAI,
  model: string,
  prompt: string,
  format: ReturnType<typeof jsonSchema>,
  input: unknown,
): Promise<{ result: T; usage: string }> {
  const completion = await openai.chat.completions.create({
    model,
    response_format: format,
    messages: [
      { role: `developer`, content: prompt },
      { role: `user`, content: JSON.stringify(input) },
    ],
  });
  const content = completion.choices[0]?.message.content;
  if (!content) throw new Error(`Empty response from ${model}`);
  const { prompt_tokens, completion_tokens } = completion.usage ?? {};
  return {
    result: JSON.parse(content) as T,
    usage: `${prompt_tokens} input + ${completion_tokens} output tokens`,
  };
}

async function write(
  openai: OpenAI,
  model: string,
  source: SourceArticle,
): Promise<NewsArticle> {
  const article = { title: source.title, content: source.markdown };
  const { result: identified } = await complete<{ game: string }>(
    openai,
    model,
    GAME_PROMPT,
    GAME_FORMAT,
    article,
  );
  const game = await findNewsGame(identified.game);
  const fiche = game?.catalog ? gameFacts(game.catalog) : undefined;

  const { result, usage } = await complete<{
    title: string;
    excerpt: string;
    content: string;
    category: NewsCategory;
  }>(openai, model, WRITER_PROMPT, WRITER_FORMAT, { ...article, fiche });
  const title = result.title.trim();
  const excerpt = result.excerpt.trim();
  const markdown = result.content.trim();
  const words = wordCount(markdown);
  if (!title || !excerpt || words < MIN_WORDS || words > MAX_WORDS) {
    throw new Error(`Article rejected (${words} words)`);
  }
  // The model may leave out a video (a spoiler), never make one up
  if (!videos(markdown).isSubsetOf(videos(source.markdown))) {
    throw new Error(`Unknown video in the article`);
  }
  console.log(
    `  ${source.url}: ${words} words, game "${identified.game}" ${game?.catalog ? `→ /jeu/${game.catalog.slug}` : `not in the catalog`}, ${usage}`,
  );

  // The model can glue a marker to the next line: one paragraph per video
  const separated = markdown.replace(
    /[^\S\n]*\{\{video:([\w-]+)\}\}[^\S\n]*/g,
    `\n\n{{video:$1}}\n\n`,
  );
  const html = (
    markdownRenderer.parse(separated, { async: false }) as string
  ).replace(/<p>\s*\{\{video:([\w-]+)\}\}\s*<\/p>/g, (_, id: string) =>
    youtubeEmbed(id),
  );
  return {
    slug: articleSlug(title, source.key),
    date: new Date().toISOString(),
    category: result.category,
    image: await newsImage({
      igdb: game?.igdb ?? null,
      steamAppId: game?.steamAppId ?? null,
      gameName: game?.name ?? null,
      category: result.category,
    }),
    title,
    excerpt,
    game: game?.catalog
      ? { name: game.catalog.name, slug: game.catalog.slug }
      : null,
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

// Bypasses the CDN cache: the file changes every hour
async function fetchSitemap(): Promise<NewsSitemap[`articles`]> {
  const response = await fetch(`${NEWS_SITEMAP_URL}?t=${Date.now()}`, {
    cache: `no-store`,
  });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`HTTP ${response.status} on the sitemap`);
  return ((await response.json()) as NewsSitemap).articles;
}

// Deletes the article files the sitemap does not list (failed runs, legacy
// translations) and the legacy index
async function purge() {
  const listed = new Set((await fetchSitemap()).map(({ slug }) => slug));
  if (listed.size === 0) throw new Error(`Empty sitemap, nothing purged`);
  const orphans: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: NEWS_ARTICLES_PREFIX, cursor });
    for (const blob of page.blobs) {
      const slug = blob.pathname
        .slice(NEWS_ARTICLES_PREFIX.length)
        .replace(/\.json$/, ``);
      if (!listed.has(slug)) orphans.push(blob.url);
    }
    cursor = page.cursor;
  } while (cursor);
  const legacy = await list({ prefix: LEGACY_INDEX_PATH });
  orphans.push(...legacy.blobs.map((blob) => blob.url));
  if (orphans.length) await del(orphans);
  console.log(`${orphans.length} files deleted`);
}

async function main() {
  const { values } = parseArgs({
    options: {
      all: { type: `boolean`, default: false },
      'dry-run': { type: `boolean`, default: false },
      purge: { type: `boolean`, default: false },
    },
  });
  const dryRun = values[`dry-run`];
  if (values.purge) return purge();

  if (!process.env.OPENAI_API_KEY) throw new Error(`Missing OPENAI_API_KEY`);
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const openai = new OpenAI();

  const sources = await fetchArticles();
  // Without a Blob token (--dry-run), no article is written yet
  const known = process.env.BLOB_READ_WRITE_TOKEN
    ? await fetchWritten(sources)
    : new Map<string, NewsSummary>();
  const missing = sources
    .slice(0, ARTICLE_COUNT)
    .filter((source) => !known.has(source.key));
  const toWrite = values.all ? missing : missing.slice(0, WRITES_PER_RUN);
  console.log(
    `${missing.length} new articles, ${toWrite.length} to write with ${model}`,
  );

  // One at a time: the catalog and IGDB are shared. A failed article is left
  // out of this run, and retried by the next one
  const written = new Map<string, NewsArticle>();
  for (const source of toWrite) {
    try {
      written.set(source.key, await write(openai, model, source));
    } catch (error) {
      console.error(`  ${source.url}: ${String(error)}`);
      process.exitCode = 1;
    }
  }

  const updatedAt = new Date().toISOString();
  const index: NewsIndex = {
    updatedAt,
    articles: sources
      .flatMap((source) => {
        const article = written.get(source.key);
        const summary = article ? toSummary(article) : known.get(source.key);
        return summary ? [summary] : [];
      })
      .slice(0, ARTICLE_COUNT),
  };
  if (index.articles.length === 0) throw new Error(`No article to publish`);

  if (dryRun) {
    console.log(JSON.stringify([...written.values()], null, 2));
    console.log(JSON.stringify(index, null, 2));
    return;
  }

  // Articles first: the index never points to a missing file
  await Promise.all(
    [...written.values()].map((article) =>
      upload(newsArticlePath(article.slug), article),
    ),
  );
  if (written.size > 0) {
    const previous = await fetchSitemap();
    const added = [...written.values()].map(({ slug, date, title }) => ({
      slug,
      date,
      title,
    }));
    const sitemap: NewsSitemap = {
      updatedAt,
      articles: [
        ...added,
        ...previous.filter(
          ({ slug }) => !added.some((article) => article.slug === slug),
        ),
      ].slice(0, SITEMAP_LENGTH),
    };
    await upload(NEWS_SITEMAP_PATH, sitemap);
  }
  const blob = await upload(NEWS_INDEX_PATH, index);
  console.log(
    `${index.articles.length} articles published (${written.size} new): ${blob.url}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
