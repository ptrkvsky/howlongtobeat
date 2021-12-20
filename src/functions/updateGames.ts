import { PrismaClient, Game } from '@prisma/client';

import axios from 'axios';

const deeplKey = process.env.DEEPL_KEY;

const prisma = new PrismaClient();

export async function updateGame(game: Game) {
  try {
    const translation = await axios.get(
      `https://api.deepl.com/v2/translate?auth_key=${deeplKey}&target_lang=fr&source_lang=en&text=${game.description}`,
    );
    console.log(translation.data.translations[0].text);
    const gameUpdated = await prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        description: translation.data.translations[0].text,
      },
    });
    return gameUpdated;
  } catch (error) {
    console.error(error);
  }
}
