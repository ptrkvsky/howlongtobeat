import type { NextApiRequest, NextApiResponse } from 'next';
import { MultipleMutationResult } from '@sanity/client';
import DBClient from '@/lib/prisma/DBClient';
import { slugify } from '@/utils/slugify';
import generateId from '@/utils/generateIds';

import sanity from '@/lib/sanity/sanityClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MultipleMutationResult>,
) {
  // Load games from prisma
  const prisma = DBClient.instance;
  prisma.$disconnect();
  const games = await prisma.game.findMany({
    take: 2000,
    skip: 8000,
  });
  const transaction = sanity.instance.transaction();

  // Load genres from Sanity
  const query = `*[_type == "genre"]`;
  const params = {};

  // Get departements from Sanity
  const sanityGenres = await sanity.instance.fetch(query, params);

  // Loop genres prisma
  games.forEach((game) => {
    const prismaGenresIds = game.genres;

    const gameGenres = prismaGenresIds.map((prismaGenreId) => {
      const sanityGenre = sanityGenres.find(
        (sanityGenre: { idIgdb: number }) =>
          sanityGenre.idIgdb === prismaGenreId,
      );

      return {
        _key: generateId(12),
        _ref: sanityGenre._id,
        _type: `reference`,
      };
    });

    const slug = slugify(game.name);
    const gameId = `game-${slug}-${game.id}`;
    const sanityGame = {
      _id: gameId,
      _type: `game`,

      name: game.name,
      rating: game.rating || 0,
      isTranslated: game.isTranslated,
      idHltb: game.idHltb,
      totalPoll: game.totalPoll,
      timeMainStory: game.timeMainStory || 0,
      timeMainExtras: game.timeMainExtras || 0,
      timeCompletionists: game.timeCompletionists || 0,
      cover: game.cover || `test`,
      genres: gameGenres,
      slug: {
        _type: `slug`,
        current: slug,
      },
      description: [
        {
          _key: generateId(12),
          _type: `block`,
          children: [
            {
              _key: generateId(12),
              _type: `span`,
              marks: [],
              text: game.description.replace(/<[^>]+>/g, ``),
            },
          ],
          markDefs: [],
          style: `normal`,
        },
      ],
    };
    transaction.createOrReplace(sanityGame);
  });
  const result = await transaction.commit();

  prisma.$disconnect();
  res.status(200).json(result);
}
