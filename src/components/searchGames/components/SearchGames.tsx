import { ALL_GAMES } from '@/features/jeu/gql';
import Fuse from 'fuse.js';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import InputSearch from './InputSearch';
import ResultSearch from './ResultSearchList';
import { SanityGame } from '@/types/sanity/SanityGame';

interface Props {
  isAdmin?: boolean;
}

type Result = {
  data: {
    allGame: SanityGame[];
  };
};

const SearchGames = ({ isAdmin = false }: Props) => {
  const [query, setQuery] = useState(``);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  const { data, loading, error } = useQuery(ALL_GAMES);

  const fuse = new Fuse(data?.allGame || [], {
    keys: [`name`],
  });

  const searchResults = query ? fuse.search<SanityGame[]>(query) : [];

  if (error) {
    console.error(error.message);
  }

  return (
    <div>
      <InputSearch
        query={query}
        setQuery={setQuery}
        setIsResultsOpen={setIsResultsOpen}
      />
      {loading && <p>loading</p>}
      {searchResults.length > 0 && (
        <ResultSearch
          isAdmin={isAdmin}
          isResultsOpen={isResultsOpen}
          setIsResultsOpen={setIsResultsOpen}
          searchResults={searchResults || []}
        />
      )}
    </div>
  );
};

export { SearchGames };
