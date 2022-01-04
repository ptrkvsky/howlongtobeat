import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Input } from './style';

interface Props {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}

const InputSearch = ({ query, setQuery }: Props) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <Input
      type="text"
      value={query}
      onChange={handleChange}
      placeholder="Rechercher votre jeu favori..."
    />
  );
};

export default InputSearch;
