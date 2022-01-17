import TemplateGenre from '@/features/genre/components/TemplateGenre';
import { getAllGenres } from '@/functions/getAllGenres';
import { getGamesByGenre } from '@/functions/getGamesByGenre';
import { getGenre } from '@/functions/getGenre';

import { SanityGame } from '@/types/sanity/SanityGame';

import { Genre } from '@prisma/client';

// This function gets called at build time
export async function getStaticPaths() {
  const genres = await getAllGenres();

  if (!genres) {
    return {
      notFound: true,
    };
  }

  const paths = genres?.map((genre) => ({
    params: { slug: genre.slug.current },
  }));

  // { fallback: false } means other routes should 404.
  // We'll pre-render only these paths at build time.
  return { paths, fallback: false };
}

interface PropsGetStaticProps {
  params: {
    slug: string;
  };
}

export async function getStaticProps({ params }: PropsGetStaticProps) {
  const genre = await getGenre(params.slug);
  const games = await getGamesByGenre(genre._id);

  return { props: { games, genre } };
  // Pass game data to the page via props
}

interface PropsGame {
  games: SanityGame[];
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
