import TemplateGenre from '@/features/genre/components/TemplateGenre';
import { getAllGenresPrisma } from '@/functions/getAllGenresPrisma';
import DBClient from '@/prisma/DBClient';
import { Game, Genre } from '@prisma/client';
import Link from 'next/link';

const prisma = DBClient.instance;

// This function gets called at build time
export async function getStaticPaths() {
  const genres = await getAllGenresPrisma();

  const paths = genres?.map((genreId) => ({
    params: { id: genreId.id.toString() },
  }));

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
  await prisma.$disconnect();

  return { props: { games, genre } };
  // Pass game data to the page via props
}

interface PropsGame {
  games: Game[];
  genre: Genre;
}

function Genre({ games, genre }: PropsGame) {
  return (
    <>
      <TemplateGenre genre={genre} games={games} />
    </>
  );
}

export default Genre;
