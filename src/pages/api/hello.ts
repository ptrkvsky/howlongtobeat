// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Game } from '@prisma/client';
import { updateGame } from '@/functions/updateGames';

const prisma = new PrismaClient();

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  async function updateGames() {
    const games = await prisma.game.findMany({
      where: {
        id: {
          lt: 100,
          gt: 1,
        },
      },
    });
    console.log(games);
    await Promise.all(games.map((game) => updateGame(game)));
  }
  console.log(`translation`);
  updateGames();
  // res.status(200).json({ name: `games` });
}
