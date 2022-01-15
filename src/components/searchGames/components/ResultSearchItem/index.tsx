import { Game } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { Wrapper, Placeholder } from './style';

interface Props {
  game: Game;
  isAdmin?: boolean;
}

const ResultSearchItem = ({ game, isAdmin = false }: Props) => {
  const link = isAdmin ? `/admin/jeu/${game.id}` : `/jeu/${game.id}`;

  return (
    <Wrapper key={game.id}>
      <Link href={link}>
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
