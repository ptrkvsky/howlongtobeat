import type { NextApiRequest, NextApiResponse } from 'next';
import sanityClient, { MultipleMutationResult } from '@sanity/client';
// import { createGenre } from '@/functions/createGenreOnGames';

const sanity = sanityClient({
  projectId: process.env.SANITY_ID,
  dataset: `production`,
  token: `skGCAJR3cuzCuwjmef5UfxLcbsVYd7hji3M6DsuwtyaI38HOFmC0Z7iEo4USY6EzO7LppD2pSzS3WNgkm3RqoEeAZSxvEvPseH0Ar4HQubgQhW57aOZ62B9SE0285pXwiYRv5pusWsvblEcfou0RjP4cq38VTNMQu67vo9w10WsBrkNG6Q7E`,
  useCdn: true,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ result: string }>,
) {
  // Load games from Sanity
  const query = `*[_type == "game"]`;
  const params = {};

  // Get departements from Sanity
  const sanityGames = await sanity.fetch(query, params);

  // Loop games prisma
  sanityGames.forEach((game: any) => {
    // sanity.delete(game._id).then((res) => {
    //   console.log(`game deleted`);
    // });
  });

  res.status(200).json({ result: `ok` });
}
