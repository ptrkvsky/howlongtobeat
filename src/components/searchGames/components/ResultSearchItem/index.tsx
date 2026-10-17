import Image from 'next/image';
import Link from 'next/link';

import { SanityGameSummary } from '@/types/sanity/SanityGame';
import styles from '../../searchGames.module.css';

interface Props {
  game: SanityGameSummary;
}

const ResultSearchItem = ({ game }: Props) => {
  return (
    <li className={styles.item}>
      <Link href={`/jeu/${game.slug.current}`}>
        {game.cover ? (
          <Image
            alt={game.name}
            src={`https:${game.cover}`}
            width={70}
            height={92}
          />
        ) : (
          <div className={styles.placeholder} />
        )}
        {game.name}
      </Link>
    </li>
  );
};

export default ResultSearchItem;
