import { IgdbGenre } from '@/types/IgdbGenre';
import axios from 'axios';
import { getHeaders } from './getHeaders';

export async function getGenresIgdb() {
  const headers = await getHeaders();
  const bodyRequestGameIgdb = `fields *; limit 50;`;

  const gamesIgdb = await axios.post(
    `https://api.igdb.com/v4/genres/`,
    bodyRequestGameIgdb,
    headers,
  );

  return gamesIgdb.data as IgdbGenre[];
}
