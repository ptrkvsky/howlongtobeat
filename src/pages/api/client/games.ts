// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import DBClient from '@/lib/prisma/DBClient';
import { findAllGames } from '@/functions/findAllGames';
import { Game } from '@prisma/client';

const prisma = DBClient.instance;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Game[]>,
) {
  const games = await findAllGames();
  prisma.$disconnect;

  res.status(200).json(games);
}
