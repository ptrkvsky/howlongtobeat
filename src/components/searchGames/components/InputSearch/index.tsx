import { ApolloQueryResult, OperationVariables } from '@apollo/client';

import { ChangeEvent, Dispatch, SetStateAction } from 'react';

import { InputSearch as InputSearchStyle } from './style';

interface Props {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  setIsResultsOpen: Dispatch<SetStateAction<boolean>>;
  // refetch: (
  //   variables?: Partial<OperationVariables> | undefined,
  // ) => Promise<ApolloQueryResult<any>>;
}

const InputSearch = ({ query, setQuery, setIsResultsOpen }: Props) => {
  const handleClick = () => {
    // refetch();
    setIsResultsOpen(true);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsResultsOpen(true);
    setQuery(event.target.value);
  };

  return (
    <InputSearchStyle
      type="text"
      value={query}
      onClick={handleClick}
      onChange={handleChange}
      placeholder="Rechercher votre jeu favori..."
    />
  );
};

export default InputSearch;
