import Seo from '@/components/Seo';

import TemplateJeu from '@/features/jeu/components/TemplateJeu';
import { findAllGames } from '@/functions/findAllGames';
import { getGame } from '@/functions/getGame';
import DBClient from '@/lib/prisma/DBClient';
import { SanityGame } from '@/types/sanity/SanityGame';
import { Game } from '@prisma/client';

// This function gets called at build time
export async function getStaticPaths() {
  const allGames = await findAllGames();
  // Get the paths we want to pre-render based on games
  const paths = allGames.map((game) => ({
    params: { slug: game.slug.current },
  }));

  // fallback: blocking (preferred) – when a request is made to a page that hasn't been generated, Next.js will server-render the page on the first request. Future requests will serve the static file from the cache.
  return { paths, fallback: `blocking` };
}

interface PropsGetStaticProps {
  params: {
    slug: string;
  };
}

// This also gets called at build time
export async function getStaticProps({ params }: PropsGetStaticProps) {
  const slug = params.slug;

  const game = await getGame(slug, true);

  if (!game) {
    return { notFound: true };
  }

  return {
    props: { game },
    revalidate: 60,
  };
}

interface PropsGame {
  game: SanityGame;
  relatedGames: Game[];
}

function Game({ game, relatedGames = [] }: PropsGame) {
  const pageSeo = {
    metaTitle: `Combien de temps faut-il pour terminer ? ${game.name}`,
    metaDescription: `Combien de temps faut-il pour terminer ? ${game.name}`,
  };

  return (
    <>
      <Seo pageSeo={pageSeo} />

      <TemplateJeu game={game} relatedGames={relatedGames} />
    </>
  );
}

export default Game;
