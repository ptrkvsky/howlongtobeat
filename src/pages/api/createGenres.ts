// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, PrismaClient } from '@prisma/client';

import { getGenre } from '@/functions/getGenre';

type Data = {
  result: any;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  async function updateGenres() {
    getGenre(35);

    res.status(200).json({ result: `yes` });
  }

  updateGenres();
}
