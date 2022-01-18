import { ALL_GAMES } from '@/features/jeu/gql';
import Fuse from 'fuse.js';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import InputSearch from './InputSearch';
import ResultSearch from './ResultSearchList';

interface Props {
  isAdmin?: boolean;
}

const SearchGames = ({ isAdmin = false }: Props) => {
  const [query, setQuery] = useState(``);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  const { data: games, loading, error, refetch } = useQuery(ALL_GAMES);

  const fuse = new Fuse(games || [], {
    keys: [`name`],
  });

  const searchResults = query ? fuse.search(query) : [];

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <div>
      <InputSearch
        query={query}
        setQuery={setQuery}
        setIsResultsOpen={setIsResultsOpen}
        refetch
      />
      {loading && <p>loading</p>}
      {searchResults.length > 0 && (
        <ResultSearch
          isAdmin={isAdmin}
          isResultsOpen={isResultsOpen}
          setIsResultsOpen={setIsResultsOpen}
          searchResults={searchResults}
        />
      )}
    </div>
  );
};

export { SearchGames };
