// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import DBClient from '@/lib/prisma/DBClient';
import { getGames } from '@/features/jeu/api';
import { SanityGame } from '@/types/sanity/SanityGame';

const prisma = DBClient.instance;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SanityGame[]>,
) {
  const games = await getGames();
  prisma.$disconnect;

  games && res.status(200).json(games);
}
