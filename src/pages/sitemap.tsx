import Head from 'next/head';
import Image from 'next/image';

import { PrismaClient, Game } from '@prisma/client';
import styles from '@/styles/Home.module.css';

const prisma = new PrismaClient();

interface Props {
  games: Game[];
}

export default function Sitemap({ games }: Props) {
  console.log(games);
  return (
    <div className={styles.container}>
      <Head>
        <title>TypeScript starter for Next.js</title>
        <meta
          name="description"
          content="TypeScript starter for Next.js that includes all you need to build amazing apps"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className={styles.title}>
        Plan du site avec ses {games.length} jeux{` `}
      </h1>
      <ul>
        {games.map((game) => (
          <li key={game.name}>{game.name}</li>
        ))}
      </ul>
    </div>
  );
}

// This function gets called at build time
export async function getStaticProps() {
  const games = await prisma.game.findMany();

  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      games,
    },
  };
}
