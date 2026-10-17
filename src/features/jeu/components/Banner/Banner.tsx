import { SanityGame } from '@/types/sanity/SanityGame';
import Image from 'next/image';
import styles from './banner.module.css';

interface Props {
  game: SanityGame;
}

const Banner = ({ game }: Props) => {
  return (
    <div className={styles.hidden}>
      <div className={styles.wrapper}>
        <Image
          priority
          alt={game.name}
          src={`https:${game.cover}`}
          fill
          sizes="100vw"
          style={{ objectFit: `cover` }}
        />
      </div>
    </div>
  );
};

export default Banner;
