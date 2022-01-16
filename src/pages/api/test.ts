// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import DBClient from '@/lib/prisma/DBClient';

const prisma = DBClient.instance;

type Data = {
  game: any;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  async function updateGames() {
    const game = await prisma.genresOnGames.upsert({
      update: {
        gameId: 1,
        genreId: 1,
      },
      create: {
        gameId: 1,
        genreId: 1,
      },
    });

    res.status(200).json({ game });
  }

  updateGames();
}
