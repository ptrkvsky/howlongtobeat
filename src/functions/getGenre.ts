import axios from 'axios';
import { getHeaders } from './getHeaders';

export async function getGenre(genre: number) {
  const headers = await getHeaders();
  const bodyRequestGameIgdb = `fields name ;`;
  console.log(headers);
  const gamesIgdb = (await axios.post(
    `https://api.igdb.com/v4/genres/`,
    bodyRequestGameIgdb,
    headers,
  )) as any;

  return gamesIgdb;
}
