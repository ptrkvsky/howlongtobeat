// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Game } from '@prisma/client';
import { updateGame } from '@/functions/updateGames';

type Data = {
  gamesUpdated: Promise<(Game | undefined)[]>;
};

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  async function updateGames() {
    // On recupere les jeux

    const games = await prisma.game.findMany({
      where: {
        id: {
          lt: 1500,
          gt: 1300,
        },
        isTranslated: false,
      },
    });

    const gamesUpdated = Promise.all(games.map((game) => updateGame(game)));
    await prisma.$disconnect();
    res.status(200).json({ gamesUpdated });
    return gamesUpdated;
  }
  updateGames();
}
