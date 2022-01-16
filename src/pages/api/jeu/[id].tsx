// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Game } from '@prisma/client';
import updateGame from '@/functions/updateGame';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ gameUpdated: Game } | { error: unknown }>,
) {
  const { method } = req;

  if (method === `POST`) {
    const {
      body: { id },
    } = req;

    if (id) {
      try {
        const gameUpdated = await updateGame(req.body);
        gameUpdated && res.status(200).json({ gameUpdated });
      } catch (error) {
        console.error(`🔥 ERROR : `, error);
        res.status(500).json({ error });
      }
    } else {
      console.log(`👩‍🚒erreur `, `ca ne marche pas `, req.body);
      res.status(400).json({
        error: `wrong id`,
      });
    }
  }
}
