import { Game } from '@prisma/client';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from 'react-query';
import { Input } from './style';

interface Props {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  setIsResultsOpen: Dispatch<SetStateAction<boolean>>;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined,
  ) => Promise<QueryObserverResult<Game[], Error>>;
}

const InputSearch = ({ query, refetch, setQuery, setIsResultsOpen }: Props) => {
  const handleClick = () => {
    setIsResultsOpen(true);
    refetch();
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
