/**
 * Client side of /actus: renders the index of the GameSpot news published on
 * Vercel Blob by scripts/fetch-gamespot.ts in the page's card template.
 */
import {
  NEWS_INDEX_URL,
  newsPageUrl,
  type NewsIndex,
  type NewsSummary,
} from '@/config/news';
import { formatDate, formatDayAndTime } from './format';

const list = document.querySelector<HTMLOListElement>(`[data-news-list]`)!;
const meta = document.querySelector<HTMLElement>(`[data-news-meta]`)!;
const template =
  document.querySelector<HTMLTemplateElement>(`[data-news-card]`)!;

function renderCard(article: NewsSummary): Node {
  const card = template.content.cloneNode(true) as DocumentFragment;
  card.querySelector(`a`)!.href = newsPageUrl(article.slug);
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
  const response = await fetch(NEWS_INDEX_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const index: NewsIndex = await response.json();

  list.replaceChildren(...index.articles.map(renderCard));
  meta.textContent = `Source : ${index.source}, mis à jour le ${formatDayAndTime(new Date(index.updatedAt))}.`;
}

loadNews().catch((error) => {
  console.error(error);
  meta.textContent = `Les actus ne sont pas disponibles pour le moment.`;
});
