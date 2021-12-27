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
  // We'll pre-render only these paths at build time.
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths, fallback: `blocking` };
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

  if (!game) {
    return { notFound: true };
  }

  const genres = await prisma.genresOnGames.findMany({
    where: {
      gameId: {
        equals: +params.id,
      },
    },
  });

  // const relatedGamesPromises =
  //   genres &&
  //   genres.map((genre) =>
  //     prisma.game.findMany({
  //       take: 20,
  //       where: {
  //         id: {
  //           gte: game.id,
  //           lte: game.id + 21,
  //           notIn: game.id,
  //         },
  //         isTranslated: true,
  //         genre: {
  //           some: {
  //             genreId: {
  //               equals: genre.genreId,
  //             },
  //           },
  //         },
  //       },
  //     }),
  //   );

  const relatedGames = await prisma.game.findMany({
    take: 20,
    where: {
      OR: [
        {
          id: {
            gte: game.id,
          },
        },
        {
          id: {
            lte: game.id + 21,
          },
        },
      ],
      NOT: {
        id: {
          equals: game.id,
        },
      },

      isTranslated: true,
    },
  });

  if (relatedGames) {
    await prisma.$disconnect();
    const relatedGamesFiltered = relatedGames.filter(
      (relatedGame) => relatedGame.id !== game?.id,
    );
    return { props: { game, relatedGames: relatedGamesFiltered } };
  } else {
    const relatedGames = await prisma.game.findMany({
      take: 21,
      where: {
        isTranslated: true,
        id: {
          gte: game.id,
          lte: game.id + 21,
          notIn: game.id,
        },
      },
    });
    await prisma.$disconnect();
    return { props: { game, relatedGames }, revalidate: 60 };
  }
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

  return (
    <>
      <Seo pageSeo={pageSeo} />
      <TemplateJeu game={game} relatedGames={relatedGames} />
    </>
  );
}

export default Game;
