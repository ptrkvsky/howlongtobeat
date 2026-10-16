import Image from 'next/image';
import Link from 'next/link';

import { Wrapper, Placeholder } from './style';
import { SanityGameSummary } from '@/types/sanity/SanityGame';

interface Props {
  game: SanityGameSummary;
}

const ResultSearchItem = ({ game }: Props) => {
  return (
    <Wrapper key={game._id}>
      <Link href={`/jeu/${game.slug.current}`}>
        {game.cover ? (
          <Image
            alt={game.name}
            src={`https:${game.cover}`}
            width={70}
            height={92}
          />
        ) : (
          <Placeholder />
        )}
        {game.name}
      </Link>
    </Wrapper>
  );
};

export default ResultSearchItem;
