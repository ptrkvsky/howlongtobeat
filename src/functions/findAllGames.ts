import DBClient from '@/prisma/DBClient';

const prisma = DBClient.instance;

export async function findAllGames() {
  const games = await prisma.game.findMany({
    where: {
      isTranslated: true,
    },
  });
  return games;
}
