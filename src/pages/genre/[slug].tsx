import TemplateGenre from '@/features/genre/components/TemplateGenre';
import { getAllGenres } from '@/functions/getAllGenres';
import { getGamesByGenre } from '@/functions/getGamesByGenre';
import { getGenre } from '@/functions/getGenre';
import { SanityGameSummary } from '@/types/sanity/SanityGame';
import { SanityGenre } from '@/types/sanity/SanityGenre';
import { GetStaticPaths, GetStaticProps } from 'next';

type Params = { slug: string };

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const genres = await getAllGenres();

  const paths = genres.map((genre) => ({
    params: { slug: genre.slug.current },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<PropsGenre, Params> = async ({
  params,
}) => {
  const genre = params && (await getGenre(params.slug));

  if (!genre) {
    return { notFound: true };
  }

  const games = await getGamesByGenre(genre._id);

  return { props: { games, genre } };
};

interface PropsGenre {
  games: SanityGameSummary[];
  genre: SanityGenre;
}

function Genre({ games, genre }: PropsGenre) {
  return <TemplateGenre genre={genre} games={games} />;
}

export default Genre;
