import type { NextApiRequest, NextApiResponse } from 'next';
import { MultipleMutationResult } from '@sanity/client';
import DBClient from '@/lib/prisma/DBClient';
import sanity from '@/lib/sanity/sanityClient';
// import { createGenre } from '@/functions/createGenreOnGames';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ result: MultipleMutationResult }>,
) {
  // Load genres from prisma
  const prisma = DBClient.instance;
  const genres = await prisma.genre.findMany();
  const transaction = sanity.instance.transaction();

  // Loop genres prisma
  genres.forEach((genre) => {
    const genreId = `genre-${genre.id}-${genre.slug}`;
    const sanityGenre = {
      _id: genreId,
      _type: `genre`,
      name: genre.name,
      description: ``,
      idIgdb: genre.idIgdb,
      slug: {
        _type: `slug`,
        current: genre.slug,
      },
    };
    transaction.createOrReplace(sanityGenre);
  });
  const result = await transaction.commit();

  res.status(200).json({ result });
}
