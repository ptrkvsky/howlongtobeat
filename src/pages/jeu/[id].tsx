import Seo from '@/components/Seo';
import TemplateJeu from '@/features/jeu/components/TemplateJeu';
import { findAllGames } from '@/functions/findAllGames';
import DBClient from '@/prisma/DBClient';
import { Game } from '@prisma/client';

const prisma = DBClient.instance;

// This function gets called at build time
export async function getStaticPaths() {
  const allGames = await findAllGames();

  // Get the paths we want to pre-render based on games
  const paths = allGames.map((game) => ({
    params: { id: game.id.toString(), allGames: allGames || [] },
  }));
  await prisma.$disconnect();
  // fallback: blocking (preferred) – when a request is made to a page that hasn't been generated, Next.js will server-render the page on the first request. Future requests will serve the static file from the cache.
  return { paths, fallback: `blocking` };
}

interface PropsGetStaticProps {
  params: {
    id: number;
    allGames: Game[];
  };
}

// This also gets called at build time
export async function getStaticProps({ params }: PropsGetStaticProps) {
  const gameId = +params.id;
  const allGames = params.allGames || [];

  const game = allGames.find((game) => game.id === gameId);

  if (!game) {
    return { notFound: true };
  }

  const relatedGames = allGames.filter(
    (allGame) => allGame.id > game.id && allGame.id < game.id + 21,
  );

  await prisma.$disconnect();

  return {
    props: { game, relatedGames, allGames: params.allGames || [] },
    revalidate: 60,
  };
}

interface PropsGame {
  game: Game;
  relatedGames: Game[];
  allGames: Game[];
}

function Game({ game, relatedGames, allGames }: PropsGame) {
  const pageSeo = {
    metaTitle: `Combien de temps faut-il pour terminer ? ${game.name}`,
    metaDescription: `Combien de temps faut-il pour terminer ? ${game.name}`,
  };

  return (
    <>
      <Seo pageSeo={pageSeo} />
      <TemplateJeu
        game={game}
        allGames={allGames}
        relatedGames={relatedGames}
      />
    </>
  );
}

export default Game;
