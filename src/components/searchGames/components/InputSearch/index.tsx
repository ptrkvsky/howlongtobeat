import { Game } from '@prisma/client';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Input } from './style';

interface Props {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  setIsResultsOpen: Dispatch<SetStateAction<boolean>>;
  games: Game[];
  setGames: Dispatch<SetStateAction<Game[]>>;
}

const url = process.env.url;

const InputSearch = ({
  query,
  setQuery,
  setIsResultsOpen,
  setGames,
}: Props) => {
  const fetchGames = async () => {
    try {
      const res = await fetch(`${url}/api/client/games`);
      const allGames = await res.json();
      setGames(allGames);
    } catch {
      setGames([]);
    }
  };

  const handleClick = () => {
    setIsResultsOpen(true);
    fetchGames();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsResultsOpen(true);
    setQuery(event.target.value);
  };

  return (
    <Input
      type="text"
      value={query}
      onClick={handleClick}
      onChange={handleChange}
      placeholder="Rechercher votre jeu favori..."
    />
  );
};

export default InputSearch;
