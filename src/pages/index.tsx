import Seo from '@/components/Seo';
import TemplateHome from '@/features/home/components/TemplateHome';
import DBClient from '@/prisma/DBClient';
import { SeoPage } from '@/types';

export async function getStaticProps() {
  const prisma = DBClient.instance;
  const games = await prisma.game.findMany({
    where: {
      isTranslated: true,
    },
  });

  return {
    props: {
      countGames: games.length,
    },
  };
}

interface PropsHome {
  countGames: number;
}

export default function Home({ countGames }: PropsHome) {
  const pageSeo: SeoPage = {
    metaTitle: `Game Over`,
    metaDescription: `Game Over repertorie la duree de vie de ${countGames} jeux. Retrouvez toutes les informations sur la duree de vie de l'ensemble de vos jeux preferes.`,
  };

  return (
    <>
      <Seo pageSeo={pageSeo} />
      <TemplateHome />
    </>
  );
}
