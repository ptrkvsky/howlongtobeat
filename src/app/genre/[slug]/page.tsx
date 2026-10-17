import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TemplateGenre from '@/features/genre/components/TemplateGenre';
import { getAllGenres } from '@/functions/getAllGenres';
import { getGamesByGenre } from '@/functions/getGamesByGenre';
import { getGenre } from '@/functions/getGenre';

export const dynamicParams = false;

export async function generateStaticParams() {
  const genres = await getAllGenres();

  return genres.map((genre) => ({ slug: genre.slug.current }));
}

export async function generateMetadata({
  params,
}: PageProps<'/genre/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const genre = await getGenre(slug);

  if (!genre) return {};

  return {
    title: `Durée de vie des jeux ${genre.name}`,
    description: `Découvrez le temps nécessaire pour terminer les jeux ${genre.name}.`,
    alternates: { canonical: `/genre/${slug}` },
  };
}

export default async function Genre({ params }: PageProps<'/genre/[slug]'>) {
  const { slug } = await params;
  const genre = await getGenre(slug);

  if (!genre) notFound();

  const games = await getGamesByGenre(genre._id);

  return <TemplateGenre genre={genre} games={games} />;
}
