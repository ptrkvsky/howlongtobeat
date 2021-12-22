import Seo from '@/components/Seo';
import TemplateJeu from '@/features/jeu/components/TemplateJeu';
import DBClient from '@/prisma/DBClient';
import { Game } from '@prisma/client';

const prisma = DBClient.instance;

// This function gets called at build time
export async function getStaticPaths() {
  const games = await prisma.game.findMany({
    where: {
      isTranslated: {
        equals: true,
      },
    },
  });

  // Get the paths we want to pre-render based on games
  const paths = games.map((game) => ({
    params: { id: game.id.toString() },
  }));
  await prisma.$disconnect();
  // { fallback: false } means other routes should 404.
  // We'll pre-render only these paths at build time.
  return { paths, fallback: false };
}

interface PropsGetStaticProps {
  params: {
    id: number;
  };
}

// This also gets called at build time
export async function getStaticProps({ params }: PropsGetStaticProps) {
  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  const game = await prisma.game.findUnique({
    where: {
      id: +params.id,
    },
  });
  await prisma.$disconnect();
  return { props: { game } };

  // Pass game data to the page via props
}

interface PropsGame {
  game: Game;
}

function Game({ game }: PropsGame) {
  const pageSeo = {
    metaTitle: `Combien de temps faut-il pour terminer ? ${game.name}`,
    metaDescription: `Combien de temps faut-il pour terminer ? ${game.name}`,
  };
  return (
    <>
      <Seo pageSeo={pageSeo} />
      <TemplateJeu game={game} />
    </>
  );
}

export default Game;
