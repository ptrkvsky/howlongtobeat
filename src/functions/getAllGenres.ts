import sanity from '@/lib/sanity/sanityClient';
import { SanityGenre } from '@/types/sanity/SanityGenre';

export async function getAllGenres() {
  const query = `*[_type == "genre"]`;
  const params = {};

  try {
    const genres: SanityGenre[] = await sanity.instance.fetch(query, params);
    return genres;
  } catch (error: any) {
    console.log(error);
  }
}
