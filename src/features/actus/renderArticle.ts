/**
 * Client side of /actus/article?slug=…: renders one GameSpot news translated
 * by scripts/fetch-gamespot.ts, read from its file on Vercel Blob.
 */
import { newsArticleUrl, type NewsArticle } from '@/config/news';
import { formatDayAndTime } from './format';

const article = document.querySelector<HTMLElement>(`[data-article]`)!;
const status = document.querySelector<HTMLElement>(`[data-article-status]`)!;

async function loadArticle() {
  const slug = new URLSearchParams(location.search).get(`slug`);
  if (!slug) throw new Error(`Missing slug`);
  const response = await fetch(newsArticleUrl(slug));
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const news: NewsArticle = await response.json();

  document.title = `${news.title} - Game Over`;
  article.querySelector(`h1`)!.textContent = news.title;
  const time = article.querySelector(`time`)!;
  time.dateTime = news.date;
  time.textContent = formatDayAndTime(new Date(news.date));
  article.querySelector(`[data-excerpt]`)!.textContent = news.excerpt;
  const image = article.querySelector<HTMLImageElement>(`[data-cover]`)!;
  if (news.image) image.src = news.image;
  else image.remove();
  // HTML rendered by scripts/fetch-gamespot.ts, without raw HTML
  article.querySelector(`[data-content]`)!.innerHTML = news.content;
  article.querySelector<HTMLAnchorElement>(`[data-source]`)!.href = news.url;

  status.remove();
  article.hidden = false;
}

loadArticle().catch((error) => {
  console.error(error);
  status.textContent = `Cet article n'est pas disponible.`;
});
