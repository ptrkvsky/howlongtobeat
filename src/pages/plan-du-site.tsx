import { Genre } from '@prisma/client';
import TemplateSitemap from '@/features/sitemap/components/TemplateSitemap';
import Seo from '@/components/Seo';
import { SeoPage } from '@/types';
import DBClient from '@/prisma/DBClient';

const prisma = DBClient.instance;

// This function gets called at build time
export async function getStaticProps() {
  const genres = await prisma.genre.findMany();

  return {
    props: {
      genres,
    },
  };
}

interface Props {
  genres: Genre[];
}

export default function Sitemap({ genres }: Props) {
  const pageSeo: SeoPage = {
    metaTitle: `Plan du site`,
    metaDescription: `Decouvrez l'ensemble des pages du site internet`,
  };

  return (
    <>
      <Seo pageSeo={pageSeo} />
      <TemplateSitemap genres={genres} />
    </>
  );
}
