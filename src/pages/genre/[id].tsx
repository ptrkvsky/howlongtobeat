import TemplateGenre from '@/features/genre/components/TemplateGenre';
import { findAllGames } from '@/functions/findAllGames';
import { getAllGenresPrisma } from '@/functions/getAllGenresPrisma';
import DBClient from '@/prisma/DBClient';
import { Game, Genre } from '@prisma/client';

const prisma = DBClient.instance;

// This function gets called at build time
export async function getStaticPaths() {
  const genres = await getAllGenresPrisma();

  if (!genres) {
    return {
      notFound: true,
    };
  }

  const genreNull: Genre = {
    id: 999,
    name: `Aucun`,
    slug: `aucun`,
    url: ``,
    idIgdb: 0,
  };

  const genresEtNull = [...genres, genreNull];

  const paths = genresEtNull?.map((genreId) => ({
    params: { id: genreId.id.toString() },
  }));
  await prisma.$disconnect();
  // { fallback: false } means other routes should 404.
  // We'll pre-render only these paths at build time.
  return { paths, fallback: false };
}

interface PropsGetStaticProps {
  params: {
    id: string;
  };
}

// This also gets called at build time
export async function getStaticProps({ params }: PropsGetStaticProps) {
  if (params.id === `999`) {
    // Games without relations
    const gamesGenreNull = await prisma.game.findMany({
      where: {
        isTranslated: true,
        genre: {
          none: {},
        },
      },
    });

    const genreNull: Genre = {
      id: 999,
      name: `Aucun`,
      slug: `aucun`,
      url: ``,
      idIgdb: 0,
    };

    await prisma.$disconnect();

    return { props: { games: gamesGenreNull, genre: genreNull } };
  } else {
    const genre = await prisma.genre.findUnique({
      where: {
        id: +params.id,
      },
    });

    const games = await prisma.game.findMany({
      where: {
        isTranslated: true,
        genre: {
          some: {
            genreId: +params.id,
          },
        },
      },
    });

    console.log(`---------------------------`, games);

    const allGames = await findAllGames();

    await prisma.$disconnect();

    return { props: { games, genre, allGames } };
    // Pass game data to the page via props
  }
}

interface PropsGame {
  games: Game[];
  genre: Genre;
  allGames: Game[];
}

function Genre({ games, genre, allGames }: PropsGame) {
  return (
    <>
      <TemplateGenre genre={genre} games={games} allGames={allGames} />
    </>
  );
}

export default Genre;
