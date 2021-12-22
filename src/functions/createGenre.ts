import { IgdbGenre } from '@/types/IgdbGenre';
import { Genre, PrismaClient, Prisma } from '@prisma/client';

export async function createGenre(
  genre: IgdbGenre,
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
) {
  try {
    const newGenre = prisma.genre.create({
      data: {
        idIgdb: genre.id,
        name: genre.name,
        slug: genre.slug,
        url: genre.slug,
      },
    });

    return newGenre;
  } catch (error: any) {
    console.error(`UNE ERREUR EST SURVENUE Jeu non traduit ${error}`);
  }
}
