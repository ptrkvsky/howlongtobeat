import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TemplateJeu from '@/features/jeu/components/TemplateJeu';
import { getGames, getGame, getRelatedGames } from '@/features/jeu/api';

// Static export: every game page is generated at build time
export const dynamicParams = false;

export async function generateStaticParams() {
  const games = await getGames();

  return games.map((game) => ({ slug: game.slug.current }));
}

export async function generateMetadata({
  params,
}: PageProps<'/jeu/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) return {};

  return {
    title: `Combien de temps faut-il pour terminer ${game.name} ?`,
    description: `Découvrez la durée de vie de ${game.name}. Quel temps vous faudra t-il pour voir la fin.`,
    alternates: { canonical: `/jeu/${slug}` },
    openGraph: game.cover ? { images: [`https:${game.cover}`] } : undefined,
  };
}

export default async function Game({ params }: PageProps<'/jeu/[slug]'>) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) notFound();

  const relatedGames = await getRelatedGames(game);

  return <TemplateJeu game={game} relatedGames={relatedGames} />;
}
