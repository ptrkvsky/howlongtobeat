import { findAllGames } from '@/functions/findAllGames';
import { getGenresFromGames } from '@/functions/getGenresFromGames';
import DBClient from '@/prisma/DBClient';
import { Game } from '@prisma/client';
import Link from 'next/link';

const prisma = DBClient.instance;

// This function gets called at build time
export async function getStaticPaths() {
  const games = await findAllGames();

  const genres = getGenresFromGames(games);

  const paths = genres.map((genreId) => ({
    params: { id: genreId.toString() },
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
  const games = await prisma.game.findMany({
    where: {
      genres: {
        has: +params.id,
      },
    },
  });
  await prisma.$disconnect();

  return { props: { games } };
  // Pass game data to the page via props
}

interface PropsGame {
  games: Game[];
}

function Game({ games }: PropsGame) {
  return (
    <ul>
      {games.map((game) => (
        <li key={game.id}>
          <Link href={`jeu/${game.id}`}>
            <a>{game.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default Game;
