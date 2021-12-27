import DBClient from '@/prisma/DBClient';

export async function getAllGenresPrisma() {
  const prisma = DBClient.instance;
  try {
    const genres = await prisma.genre.findMany();
    return genres;
  } catch (error: any) {
    console.error(`UNE ERREUR EST SURVENUE: impossible de charger les genres`);
  } finally {
    await prisma.$disconnect();
  }
}
