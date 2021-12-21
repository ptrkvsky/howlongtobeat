import Head from 'next/head';
import { PrismaClient, Game } from '@prisma/client';
import { HomeTitle } from '@/styles/components/titles/HomeTitle';

const prisma = new PrismaClient();

interface Props {
  games: Game[];
}

export default function Sitemap({ games }: Props) {
  return (
    <>
      <Head>
        <title>Pan du site</title>
        <meta name="description" content="Plan du site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HomeTitle>
        Plan du site
        <br /> {games.length} jeux
      </HomeTitle>
      <ul>
        {games.map((game) => (
          <li key={game.name}>{game.name}</li>
        ))}
      </ul>
    </>
  );
}

// This function gets called at build time
export async function getStaticProps() {
  const games = await prisma.game.findMany({
    where: {
      isTranslated: {
        equals: true,
      },
    },
  });

  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      games,
    },
  };
}
