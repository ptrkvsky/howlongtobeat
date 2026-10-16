import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import InputSearch from './InputSearch';
import ResultSearch from './ResultSearchList';
import { SanityGameSummary } from '@/types/sanity/SanityGame';

interface Props {
  isAdmin?: boolean;
}

// Generated at build time by scripts/build-static-data.ts
const SEARCH_INDEX_URL = `/search-index.json`;

const SearchGames = ({ isAdmin = false }: Props) => {
  const [query, setQuery] = useState(``);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [games, setGames] = useState<SanityGameSummary[]>();
  const [loading, setLoading] = useState(false);

  // Load the index lazily, the first time the input is used
  const loadGames = async () => {
    if (games || loading) return;
    setLoading(true);
    try {
      const response = await fetch(SEARCH_INDEX_URL);
      setGames(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fuse = useMemo(
    () => new Fuse(games || [], { keys: [`name`] }),
    [games],
  );

  const searchResults = query ? fuse.search(query) : [];

  return (
    <div>
      <InputSearch
        query={query}
        setQuery={setQuery}
        setIsResultsOpen={setIsResultsOpen}
        onOpen={loadGames}
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
