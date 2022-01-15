import { Game } from '@prisma/client';
import Fuse from 'fuse.js';
import { useState } from 'react';
import { useQuery, UseQueryResult } from 'react-query';
import fetchGames from '../api/fetchGames';
import InputSearch from './InputSearch';
import ResultSearch from './ResultSearchList';

interface Props {
  isAdmin?: boolean;
}

const SearchGames = ({ isAdmin = false }: Props) => {
  const [query, setQuery] = useState(``);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  const {
    isLoading,
    isError,
    data: games,
    refetch,
  }: UseQueryResult<Game[], Error> = useQuery<Game[], Error>(
    `games`,
    fetchGames,
    {
      enabled: false, // turned off by default, manual refetch is needed
      staleTime: 50000,
    },
  );

  const fuse = new Fuse(games || [], {
    keys: [`name`],
  });

  const searchResults = query ? fuse.search(query) : [];

  if (isError) {
    return <p>error</p>;
  }

  return (
    <div>
      <InputSearch
        query={query}
        setQuery={setQuery}
        refetch={refetch}
        setIsResultsOpen={setIsResultsOpen}
      />
      {isLoading && <p>loading</p>}
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
