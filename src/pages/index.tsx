import Preloader from '@/components/Preloader/Container';
import Seo from '@/components/Seo';
import TemplateHome from '@/features/home/components/TemplateHome';
import { getGames } from '@/features/jeu/api';
import { SeoPage } from '@/types';
import { Game } from '@prisma/client';

export async function getStaticProps() {
  const games = await getGames();

  return {
    props: {
      countGames: games?.length,
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
      <Preloader Template={() => <TemplateHome countGames={countGames} />} />
      {/* <TemplateHome countGames={countGames} /> */}
    </>
  );
}
