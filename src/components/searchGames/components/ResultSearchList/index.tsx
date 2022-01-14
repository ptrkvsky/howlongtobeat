import useOutsideAlerter from '@/hooks/useOutsideAlerter';
import { Game } from '@prisma/client';
import Fuse from 'fuse.js';
import { Dispatch, SetStateAction, useRef } from 'react';
import ResultSearchItem from '../ResultSearchItem';

import { Wrapper } from './style';

interface Props {
  searchResults: Fuse.FuseResult<Game>[];
  isResultsOpen: boolean;
  setIsResultsOpen: Dispatch<SetStateAction<boolean>>;
  isAdmin?: boolean;
}

const ResultSearch = ({
  searchResults,
  isResultsOpen,
  setIsResultsOpen,
  isAdmin = false,
}: Props) => {
  const slicedResults = searchResults.slice(0, 33);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = () => {
    setIsResultsOpen(false);
  };

  useOutsideAlerter(wrapperRef, handleClickOutside);

  return (
    <Wrapper
      className={`${isResultsOpen ? `open` : `close`} `}
      ref={wrapperRef}
    >
      <ul>
        {slicedResults.map((game) => (
          <ResultSearchItem
            isAdmin={isAdmin}
            game={game.item}
            key={game.item.id}
          />
        ))}
      </ul>
    </Wrapper>
  );
};

export default ResultSearch;
