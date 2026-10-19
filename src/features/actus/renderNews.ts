/**
 * Client side of /actus: renders the GameSpot news published on Vercel Blob
 * by scripts/fetch-gamespot.ts in the page's card template.
 */
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

const list = document.querySelector<HTMLOListElement>(`[data-news-list]`)!;
const meta = document.querySelector<HTMLElement>(`[data-news-meta]`)!;
const template =
  document.querySelector<HTMLTemplateElement>(`[data-news-card]`)!;

const formatDate = new Intl.DateTimeFormat(`fr-FR`, {
  dateStyle: `long`,
  timeStyle: `short`,
  timeZone: `Europe/Paris`,
});
const formatDay = new Intl.DateTimeFormat(`fr-FR`, {
  dateStyle: `long`,
  timeZone: `Europe/Paris`,
});
const formatTime = new Intl.DateTimeFormat(`fr-FR`, {
  timeStyle: `short`,
  timeZone: `Europe/Paris`,
});

function renderCard(article: NewsArticle): Node {
  const card = template.content.cloneNode(true) as DocumentFragment;
  card.querySelector(`a`)!.href = article.url;
  const image = card.querySelector(`img`)!;
  if (article.image) image.src = article.image;
  else image.remove();
  const time = card.querySelector(`time`)!;
  time.dateTime = article.date;
  time.textContent = formatDate.format(new Date(article.date));
  card.querySelector(`h2`)!.textContent = article.title;
  card.querySelector(`p`)!.textContent = article.excerpt;
  return card;
}

async function loadNews() {
  const feedUrl = list.dataset.feedUrl;
  if (!feedUrl) throw new Error(`PUBLIC_GAMESPOT_JSON_URL is not set`);
  const response = await fetch(feedUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const feed: NewsFeed = await response.json();

  list.replaceChildren(...feed.articles.map(renderCard));
  const updatedAt = new Date(feed.updatedAt);
  meta.textContent = `Source : ${feed.source}, mis à jour le ${formatDay.format(updatedAt)} à ${formatTime.format(updatedAt)}.`;
}

loadNews().catch((error) => {
  console.error(error);
  meta.textContent = `Les actus ne sont pas disponibles pour le moment.`;
});
