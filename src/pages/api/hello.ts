// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, PrismaClient } from '@prisma/client';
import { updateGame } from '@/functions/updateGames';

const prisma = new PrismaClient();

type Data = {
  games: any;
  gamesUpdated: any;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  async function updateGames() {
    const games = await prisma.game.findMany({
      where: {
        id: {
          lt: 601,
        },
        isTranslated: {
          equals: false,
        },
      },
    });

    const gamesUpdated = await Promise.all(
      games.map((game) => updateGame(game)),
    );

    res.status(200).json({ games, gamesUpdated });
  }

  updateGames();
}
