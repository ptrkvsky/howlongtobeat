import useOutsideAlerter from '@/hooks/useOutsideAlerter';
import { SanityGameSummary } from '@/types/sanity/SanityGame';
import { FuseResult } from 'fuse.js';
import { Dispatch, SetStateAction, useRef } from 'react';
import ResultSearchItem from '../ResultSearchItem';

import styles from '../../searchGames.module.css';

interface Props {
  searchResults: FuseResult<SanityGameSummary>[];
  isResultsOpen: boolean;
  setIsResultsOpen: Dispatch<SetStateAction<boolean>>;
  isAdmin?: boolean;
}

const ResultSearch = ({
  searchResults,
  isResultsOpen,
  setIsResultsOpen,
}: Props) => {
  const slicedResults = searchResults.slice(0, 33);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = () => {
    setIsResultsOpen(false);
  };

  useOutsideAlerter(wrapperRef, handleClickOutside);

  return (
    <div
      className={`${styles.results} ${isResultsOpen ? `` : styles.close}`}
      ref={wrapperRef}
    >
      <ul>
        {slicedResults.map((game) => (
          <ResultSearchItem game={game.item} key={game.item._id} />
        ))}
      </ul>
    </div>
  );
};

export default ResultSearch;
