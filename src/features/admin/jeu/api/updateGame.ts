import { Game } from '@prisma/client';

const updateGame = async (game: Game): Promise<Game> => {
  const res: Response = await fetch(`/api/jeu/${game.id}`, {
    method: `POST`,
    body: JSON.stringify(game),
    headers: new Headers({
      'Content-Type': `application/json`,
      Accept: `application/json`,
    }),
  });
  if (res.ok) {
    return res.json();
  }
  throw new Error(`👩‍🚒 --> An error occured while updating the game.`);
};

export default updateGame;
