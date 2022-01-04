import { Game } from '@prisma/client';
import Fuse from 'fuse.js';
import Link from 'next/link';

import { Wrapper } from './style';

interface Props {
  searchResults: Fuse.FuseResult<Game>[];
}

const ResultSearch = ({ searchResults }: Props) => {
  return (
    <Wrapper>
      <ul>
        {searchResults.map((game) => (
          <li key={game.item.id}>
            <Link href={`/jeu/${game.item.id}`}>
              <a>
                {game.item.cover && (
                  <img
                    alt={game.item.name}
                    src={`https:${game.item.cover}`}
                    width={70}
                    height={92}
                  />
                )}

                {game.item.name}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </Wrapper>
  );
};

export default ResultSearch;
