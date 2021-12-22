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
    const genreOnGame = prisma.genresOnGames.findFirst({
      where: {
        genreId: genreId,
        gameId: gameId,
      },
    });

    if (!genreOnGame) {
      const genresOnGames = await prisma.genresOnGames.create({
        data: {
          gameId: genreId,
          genreId: gameId,
        },
      });
      return genresOnGames;
    } else {
      console.error(`existe déjà`);
    }
  } catch (error: any) {
    console.error(
      `UNE ERREUR EST SURVENUE  gameid : ${gameId} genreid : ${gameId}`,
    );
  }
}
