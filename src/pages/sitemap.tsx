import Head from 'next/head';
import { PrismaClient, Game } from '@prisma/client';
import TemplateSitemap from '@/features/sitemap/components/TemplateSitemap';
import Seo from '@/components/Seo';
import { SeoPage } from '@/types';

const prisma = new PrismaClient();

interface Props {
  games: Game[];
}

export default function Sitemap({ games }: Props) {
  const pageSeo: SeoPage = {
    metaTitle: `Plan du site`,
    metaDescription: `Decouvrez l'ensemble des pages du site internet`,
  };

  return (
    <>
      <Seo pageSeo={pageSeo} />
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
