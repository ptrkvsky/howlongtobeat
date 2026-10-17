import type { Metadata } from 'next';
import TemplateSitemap from '@/features/sitemap/components/TemplateSitemap';
import { getAllGenres } from '@/functions/getAllGenres';

export const metadata: Metadata = {
  title: `Plan du site`,
  description: `Decouvrez l'ensemble des pages du site internet`,
};

export default async function Sitemap() {
  const genres = await getAllGenres();

  return <TemplateSitemap genres={genres} />;
}
