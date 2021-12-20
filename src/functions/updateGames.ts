import { PrismaClient, Game } from '@prisma/client';

import axios from 'axios';

const deeplKey = process.env.DEEPL_KEY;

const prisma = new PrismaClient();

export async function updateGame(game: Game) {
  try {
    const headers = {
      'content-type': `application/x-www-form-urlencoded`,
    } as any;

    const translationDeepl = await axios({
      method: `get`,
      url: `https://api.deepl.com/v2/translate?auth_key=${deeplKey}&text=${encodeURI(
        game.description,
      )}&target_lang=fr`,
      headers,
    });

    const translation = translationDeepl.data.translations[0].text;
    if (translation && translation !== game.description) {
      const gameUpdated = await prisma.game.update({
        where: {
          id: game.id,
        },
        data: {
          description: translation,
          isTranslated: true,
        },
      });
      return gameUpdated;
    } else {
      console.error(`Jeu non traduit ${game.id} - ${game.name}`);
    }
  } catch (error: any) {
    console.error(
      `UNE ERREUR EST SURVENUE Jeu non traduit ${game.id} - ${game.name}`,
    );
    if (error.response) {
      console.error(`ERREUR :`, error.response);
    } else {
      console.error(`ERREUR :`, error);
    }
  }
}
