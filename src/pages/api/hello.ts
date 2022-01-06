// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { updateGame } from '@/functions/updateGames';
import DBClient from '@/prisma/DBClient';

type Data = {
  games: any;
  gamesUpdated: any;
};

const prisma = DBClient.instance;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  async function updateGames() {
    console.log(`hello`);
    const games = await prisma.game.findMany({
      where: {
        id: {
          lt: 1500,
        },
        isTranslated: {
          equals: false,
        },
      },
    });

    console.log(games);

    const gamesUpdated = await Promise.all(
      games.map((game) => updateGame(game)),
    );

    res.status(200).json({ games, gamesUpdated });
  }
  console.log(`hello`);
  await updateGames();
}
