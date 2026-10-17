import { SanityGameSummary } from '@/types/sanity/SanityGame';
import RelatedGamesItem from '../RelatedGamesItem';
import styles from '../relatedGames.module.css';

interface Props {
  relatedGames: SanityGameSummary[];
}

const RelatedGamesList = ({ relatedGames }: Props) => {
  return (
    <nav className={styles.menu}>
      {relatedGames.map((relatedGame) => (
        <RelatedGamesItem key={relatedGame._id} relatedGame={relatedGame} />
      ))}
    </nav>
  );
};

export default RelatedGamesList;
