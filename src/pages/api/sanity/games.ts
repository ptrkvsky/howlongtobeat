import type { NextApiRequest, NextApiResponse } from 'next';
import sanity from '@/lib/sanity/sanityClient';

/**
 * Return all games from sanity
 * @param req
 * @param res
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ result: string }>,
) {
  // Load games from Sanity
  const query = `*[_type == "game"][0..5]`;
  const params = {};

  // Get games from Sanity
  const sanityGames = await sanity.instance.fetch(query, params);

  res.status(200).json({ result: sanityGames });
}
