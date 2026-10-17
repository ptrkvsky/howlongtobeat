import { ChangeEvent, Dispatch, SetStateAction } from 'react';

import styles from '../../searchGames.module.css';

interface Props {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  setIsResultsOpen: Dispatch<SetStateAction<boolean>>;
  onOpen: () => void;
}

const InputSearch = ({ query, setQuery, setIsResultsOpen, onOpen }: Props) => {
  const handleClick = () => {
    onOpen();
    setIsResultsOpen(true);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOpen();
    setIsResultsOpen(true);
    setQuery(event.target.value);
  };

  return (
    <input
      className={styles.input}
      type="text"
      value={query}
      onClick={handleClick}
      onChange={handleChange}
      placeholder="Rechercher votre jeu favori..."
    />
  );
};

export default InputSearch;
