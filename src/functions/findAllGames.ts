import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findAllGames() {
  const games = await prisma.game.findMany({
    where: {
      isTranslated: {
        equals: true,
      },
    },
  });
  await prisma.$disconnect();
  return games;
}
