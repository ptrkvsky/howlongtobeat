import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Input } from './style';

interface Props {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  setIsResultsOpen: Dispatch<SetStateAction<boolean>>;
}

const InputSearch = ({ query, setQuery, setIsResultsOpen }: Props) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsResultsOpen(true);
    setQuery(event.target.value);
  };

  return (
    <Input
      type="text"
      value={query}
      onClick={() => setIsResultsOpen(true)}
      onChange={handleChange}
      placeholder="Rechercher votre jeu favori..."
    />
  );
};

export default InputSearch;
