import type { NextApiRequest, NextApiResponse } from 'next';
import { createGenreOnGames } from '@/functions/createGenreOnGames';
import DBClient from '@/prisma/DBClient';

type Data = {
  ok: any;
};

// Mise à jour des genres de jeu
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const prisma = DBClient.instance;
  async function updateGenres() {
    const genresPrisma = await prisma.genre.findMany();
    const games = await prisma.game.findMany({
      where: {
        id: {
          gt: 1599,
          lt: 1700,
        },
        isTranslated: {
          equals: true,
        },
        genres: {
          isEmpty: false,
        },
      },
    });

    const promises: any[] = [];

    games.map((game) => {
      // id jeu
      const gameId = game.id;
      // ids igdb du jeu
      const gameGenres = game.genres;
      // je vais récupérer la concordance des ids dans le tableau de genres prisma
      const genresGamePrisma: number[] = [];
      // Pour tous les genres qui existe
      genresPrisma.forEach((genrePrisma) => {
        // Je parcour les genres de mon jeu
        gameGenres.forEach((gameGenre) => {
          // Si le jeu de mon jeu est égal à un genre existant
          if (gameGenre === genrePrisma.idIgdb) {
            genresGamePrisma.push(genrePrisma.id);
          }
        });
      });
      // Si j'ai des genres
      if (genresGamePrisma.length > 0) {
        // Pour chacun de ses genres
        genresGamePrisma.map((genreGamePrisma) => {
          if (genreGamePrisma && gameId) {
            promises.push(createGenreOnGames(genreGamePrisma, gameId, prisma));
          }
        });
      }
    });

    const miseajour = await Promise.all(promises);
    await prisma.$disconnect();
    return miseajour;
  }

  const miseajour = await updateGenres();
  res.status(200).json({ ok: miseajour });
}
