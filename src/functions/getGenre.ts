import { getAllGenres } from './getAllGenres';

export async function getGenre(slug: string) {
  const genres = await getAllGenres();

  return genres.find((genre) => genre.slug.current === slug);
}
