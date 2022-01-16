import { PrismaClient, Prisma } from '@prisma/client';

export async function createGenreOnGames(
  genreId: number,
  gameId: number,
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
) {
  try {
    // Test si l'élément est présent
    const genreOnGame = await prisma.genresOnGames.findFirst({
      where: {
        genreId: genreId,
        gameId: gameId,
      },
    });

    if (!genreOnGame) {
      const genresOnGames = prisma.genresOnGames.create({
        data: {
          gameId: gameId,
          genreId: genreId,
        },
      });
      return genresOnGames;
    } else {
      console.log(genreId, gameId);
      console.error(`existe déjà`);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`existe déjà`);
        }, 100);
      });
    }
  } catch (error: any) {
    console.error(
      `UNE ERREUR EST SURVENUE  gameid : ${gameId} genreid : ${gameId}`,
    );
  }
}
