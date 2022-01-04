import { Game } from '@prisma/client';
import Fuse from 'fuse.js';
import { useState } from 'react';
import InputSearch from './InputSearch';
import ResultSearch from './ResultSearch';

interface Props {
  games: Game[];
}

const SearchGames = ({ games }: Props) => {
  const [query, setQuery] = useState(``);

  const fuse = new Fuse(games, {
    keys: [`name`],
  });

  const searchResults = query ? fuse.search(query) : [];

  return (
    <div>
      <InputSearch query={query} setQuery={setQuery} />
      {searchResults.length > 0 && (
        <ResultSearch searchResults={searchResults} />
      )}
    </div>
  );
};

export { SearchGames };
