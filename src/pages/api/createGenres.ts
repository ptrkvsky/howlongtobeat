import type { NextApiRequest, NextApiResponse } from 'next';
import { getGenresIgdb } from '@/functions/getGenresIgdb';
// import { createGenre } from '@/functions/createGenreOnGames';
import { PrismaClient } from '@prisma/client';

type Data = {
  genres: any;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const prisma = new PrismaClient();
  async function updateGenres() {
    const genres = await getGenresIgdb();

    // Promise.all(genres.map((genre) => createGenre(genre, prisma)));
    await prisma.$disconnect();
    res.status(200).json({ genres });
  }

  updateGenres();
}
