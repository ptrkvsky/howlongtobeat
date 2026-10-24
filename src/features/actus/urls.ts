import type { NewsCategory } from '@/config/news';
import urls from '@/config/urls';

// /actus/categorie/sortie, then /actus/categorie/sortie/2…
export const newsCategoryUrl = (category: NewsCategory) =>
  `${urls.actus}/categorie/${category}`;
