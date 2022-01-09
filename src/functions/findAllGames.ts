import DBClient from '@/prisma/DBClient';

export async function findAllGames() {
  const prisma = DBClient.instance;
  const games = await prisma.game.findMany({
    where: {
      isTranslated: true,
    },
  });

  return games;
}
