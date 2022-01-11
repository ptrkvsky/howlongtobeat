import Seo from '@/components/Seo';
import TemplateHome from '@/features/home/components/TemplateHome';
import { findAllGames } from '@/functions/findAllGames';
import DBClient from '@/prisma/DBClient';
import { SeoPage } from '@/types';
import { Game } from '@prisma/client';

export async function getStaticProps() {
  const prisma = DBClient.instance;
  const games = await findAllGames();
  await prisma.$disconnect();

  return {
    props: {
      countGames: games.length,
    },
  };
}

interface PropsHome {
  countGames: number;
  games: Game[];
}

export default function Home({ countGames }: PropsHome) {
  const pageSeo: SeoPage = {
    metaTitle: `Découvrez le temps de jeu necessaire pour terminer vous jeux favoris.`,
    metaDescription: `Game Over repertorie la durée de vie de ${countGames} jeux. Retrouvez toutes les informations sur la duree de vie de l'ensemble de vos jeux preferes.`,
  };

  return (
    <>
      <Seo pageSeo={pageSeo} />
      <TemplateHome countGames={countGames} />
    </>
  );
}
