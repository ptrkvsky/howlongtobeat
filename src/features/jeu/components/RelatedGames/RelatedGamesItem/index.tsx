import { SanityGameSummary } from '@/types/sanity/SanityGame';
import Link from 'next/link';
import Cover from '../../Cover';
import styles from '../relatedGames.module.css';

interface Props {
  relatedGame: SanityGameSummary;
}

const RelatedGamesItem = ({ relatedGame }: Props) => {
  return (
    <div className={styles.item}>
      <div className={styles.link}>
        <Link href={`/jeu/${relatedGame.slug.current}`}>
          {relatedGame.name}
        </Link>
      </div>
      <div className={styles.img}>
        {relatedGame.cover && <Cover game={relatedGame} />}
      </div>
      <div className={styles.marquee}>
        <div className={styles.marqueeInner} aria-hidden="true">
          <span>{relatedGame.name}</span>
          <span>{relatedGame.name}</span>
          <span>{relatedGame.name}</span>
          <span>{relatedGame.name}</span>
        </div>
      </div>
    </div>
  );
};

export default RelatedGamesItem;
