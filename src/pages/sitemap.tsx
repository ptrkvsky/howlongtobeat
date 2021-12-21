import Head from 'next/head';
import { PrismaClient, Game } from '@prisma/client';
import TemplateSitemap from '@/features/sitemap/components/TemplateSitemap';

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

      <TemplateSitemap games={games} />
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
