import { Game } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { Wrapper, Placeholder } from './style';

interface Props {
  game: Game;
}

const ResultSearchItem = ({ game }: Props) => {
  return (
    <Wrapper key={game.id}>
      <Link href={`/jeu/${game.id}`}>
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
