import type { Metadata } from 'next';
import TemplateHome from '@/features/home/components/TemplateHome';
import { getGames } from '@/features/jeu/api';
import { siteInformations } from '@/config/siteInformations';

export async function generateMetadata(): Promise<Metadata> {
  const games = await getGames();

  return {
    title: {
      absolute: `Découvrez le temps de jeu necessaire pour terminer vous jeux favoris. - ${siteInformations.title}`,
    },
    description: `Game Over repertorie la durée de vie de ${games.length} jeux. Retrouvez toutes les informations sur la duree de vie de l'ensemble de vos jeux preferes.`,
  };
}

export default async function Home() {
  const games = await getGames();

  return <TemplateHome countGames={games.length} />;
}
