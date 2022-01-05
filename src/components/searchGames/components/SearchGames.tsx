import { Game } from '@prisma/client';
import Fuse from 'fuse.js';
import { useEffect, useState } from 'react';
import InputSearch from './InputSearch';
import ResultSearch from './ResultSearchList';

interface Props {
  games: Game[];
}

const SearchGames = ({ games }: Props) => {
  const [query, setQuery] = useState(``);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  const fuse = new Fuse(games, {
    keys: [`name`],
  });

  const searchResults = query ? fuse.search(query) : [];

  return (
    <div>
      <InputSearch
        query={query}
        setQuery={setQuery}
        setIsResultsOpen={setIsResultsOpen}
      />
      {searchResults.length > 0 && (
        <ResultSearch
          isResultsOpen={isResultsOpen}
          setIsResultsOpen={setIsResultsOpen}
          searchResults={searchResults}
        />
      )}
    </div>
  );
};

export { SearchGames };
