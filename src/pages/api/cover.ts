// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Game } from '@prisma/client';
import { updateGame } from '@/functions/updateGames';

type Data = {
  games: Game[];
};

const prisma = new PrismaClient();

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  async function updateGames() {
    // On recupere les jeux

    const games = await prisma.game.findMany({
      where: {
        id: {
          lt: 1000,
        },
      },
    });

    // return Promise.all(games.map((game) => updateGame(game)));
  }

  // updateGames();

  res.status(200);
}
