import Image from 'next/image';
import Link from 'next/link';

import { Wrapper, Placeholder } from './style';
import { SanityGame } from '@/types/sanity/SanityGame';

interface Props {
  game: SanityGame;
}

const ResultSearchItem = ({ game }: Props) => {
  return (
    <Wrapper key={game._id}>
      <Link href={`/jeu/${game.slug.current}`}>
        <a>
          {game.cover ? (
            <Image
              layout="fixed"
              alt={game.name}
              src={`https:${game.cover}`}
              width={70}
              height={92}
            />
          ) : (
            <Placeholder />
          )}
          {game.name}
        </a>
      </Link>
    </Wrapper>
  );
};

export default ResultSearchItem;
