import TemplateSitemap from '@/features/sitemap/components/TemplateSitemap';
import Seo from '@/components/Seo';
import { SeoPage } from '@/types';
import { getGames } from '@/features/jeu/api';
import { getAllGenres } from '@/functions/getAllGenres';
import { SanityGame } from '@/types/sanity/SanityGame';
import { SanityGenre } from '@/types/sanity/SanityGenre';

// This function gets called at build time
export async function getStaticProps() {
  const genres = await getAllGenres();
  const allGames = await getGames();

  return {
    props: {
      genres,
      allGames,
    },
  };
}

interface Props {
  genres: SanityGenre[];
  allGames: SanityGame[];
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
