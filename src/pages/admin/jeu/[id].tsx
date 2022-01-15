import LayoutAdmin from '@/components/layouts/admin/LayoutAdmin';
import Seo from '@/components/Seo';
import TemplateJeuAdmin from '@/features/admin/jeu/components/TemplateJeuAdmin';
import DBClient from '@/prisma/DBClient';
import { Game } from '@prisma/client';
import { GetServerSideProps } from 'next/types';

const prisma = DBClient.instance;

// This also gets called at build time
export const getServerSideProps: GetServerSideProps = async (context) => {
  const gameId = context?.params?.id || 0;

  const game = await prisma.game.findUnique({
    where: {
      id: +gameId,
    },
  });

  if (!game) {
    return { notFound: true };
  }

  await prisma.$disconnect();

  return {
    props: {
      data: game,
    },
  };
};

interface PropsGame {
  data: Game;
}

function Game({ data: game }: PropsGame) {
  const pageSeo = {
    metaTitle: `Combien de temps faut-il pour terminer ? ${game.name}`,
    metaDescription: `Combien de temps faut-il pour terminer ? ${game.name}`,
  };

  return (
    <>
      <Seo pageSeo={pageSeo} />
      <LayoutAdmin>
        <TemplateJeuAdmin game={game} />
      </LayoutAdmin>
    </>
  );
}

export default Game;
