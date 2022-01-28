import { SanityGame } from '@/types/sanity/SanityGame';

import Image from 'next/image';
import { Hidden, Wrapper } from './style';

interface Props {
  game: SanityGame;
}

const Banner = ({ game }: Props) => {
  return (
    <>
      <Hidden>
        <Wrapper>
          <Image
            priority
            alt={game.name}
            src={`https:${game.cover}`}
            layout="fill"
            objectFit="cover"
          />
        </Wrapper>
      </Hidden>
    </>
  );
};

export default Banner;
