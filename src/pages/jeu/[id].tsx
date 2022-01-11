import Seo from '@/components/Seo';
import { siteInformations } from '@/config/siteInformations';
import TemplateJeu from '@/features/jeu/components/TemplateJeu';
import { findAllGames } from '@/functions/findAllGames';
import DBClient from '@/prisma/DBClient';
import { Game } from '@prisma/client';
import { useEffect, useState } from 'react';

const prisma = DBClient.instance;

const url = process.env.SITE_URL || siteInformations.url;

// This function gets called at build time
export async function getStaticPaths() {
  const allGames = await findAllGames();

  // Get the paths we want to pre-render based on games
  const paths = allGames.map((game) => ({
    params: { id: game.id.toString(), allGames },
  }));
  await prisma.$disconnect();
  // fallback: blocking (preferred) – when a request is made to a page that hasn't been generated, Next.js will server-render the page on the first request. Future requests will serve the static file from the cache.
  return { paths, fallback: `blocking` };
}

interface PropsGetStaticProps {
  params: {
    id: number;
  };
}

// This also gets called at build time
export async function getStaticProps({ params }: PropsGetStaticProps) {
  const gameId = +params.id;

  const game = await prisma.game.findUnique({
    where: {
      id: +params.id,
    },
  });

  if (!game) {
    return { notFound: true };
  }

  const relatedGames = await prisma.game.findMany({
    take: 20,
    where: {
      id: {
        gt: gameId + 20,
      },
      isTranslated: true,
    },
  });

  await prisma.$disconnect();

  return {
    props: { game, relatedGames },
    revalidate: 60,
  };
}

interface PropsGame {
  game: Game;
  relatedGames: Game[];
}

function Game({ game, relatedGames }: PropsGame) {
  const pageSeo = {
    metaTitle: `Combien de temps faut-il pour terminer ? ${game.name}`,
    metaDescription: `Combien de temps faut-il pour terminer ? ${game.name}`,
  };

  const [allGames, setAllGames] = useState<Game[]>();

  const fetchGames = async () => {
    try {
      const res = await fetch(`${url}/api/client/games`);
      const allGames = await res.json();
      setAllGames(allGames);
    } catch {
      setAllGames([]);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <>
      <Seo pageSeo={pageSeo} />
      {allGames && (
        <TemplateJeu
          game={game}
          allGames={allGames}
          relatedGames={relatedGames}
        />
      )}
    </>
  );
}

export default Game;
