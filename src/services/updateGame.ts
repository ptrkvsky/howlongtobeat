import DBClient from '@/prisma/DBClient';
import { Game } from '@prisma/client';

const prisma = DBClient.instance;

const updateGame = async (game: Game) => {
  console.log(`🌄 the game`, game.id);

  if (game.id) {
    try {
      const gameUpdated = await prisma.game.update({
        where: {
          id: game.id,
        },
        data: {
          description: game.description,
        },
      });
      return gameUpdated;
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      // we'll proceed, but let's report it
      console.error({ message });
    }
  } else {
    console.log(`💔 pas de game id`);
  }
};

export default updateGame;
