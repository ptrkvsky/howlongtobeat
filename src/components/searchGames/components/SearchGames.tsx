import { Game } from '@prisma/client';
import Fuse from 'fuse.js';
import { useState } from 'react';
import InputSearch from './InputSearch';
import ResultSearch from './ResultSearchList';

const SearchGames = () => {
  const [query, setQuery] = useState(``);
  const [games, setGames] = useState<Game[]>([]);
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
        games={games}
        setGames={setGames}
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
