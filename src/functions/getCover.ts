import { Game } from '@prisma/client';
import { setTimeout } from 'timers/promises';
import axios from 'axios';
import { getHeaders } from './getHeaders';

export async function getCover(game: Game) {
  await setTimeout(5000);
  const headers = await getHeaders();
  const bodyRequestGameIgdb = `fields name, cover, first_release_date, summary, rating, cover; search "${game?.name}";`;

  const gamesIgdb = (await axios.post(
    `https://api.igdb.com/v4/games/`,
    bodyRequestGameIgdb,
    headers,
  )) as any;

  const gameIgdb = gamesIgdb.data.find(
    (gameIgdb: any) => gameIgdb.name === game?.name,
  );
  // COVER
  if (gameIgdb) {
    const bodyRequestCoverIgdb = `fields url; where id = ${
      gameIgdb.cover || gamesIgdb.data[0]
    };`;
    const coverIgdb = (await axios.post(
      `https://api.igdb.com/v4/covers/`,
      bodyRequestCoverIgdb,
      headers,
    )) as any;

    return coverIgdb.data[0].url;
  }
  return ``;
}
