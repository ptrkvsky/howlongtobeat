import { SanityGameSummary } from '@/types/sanity/SanityGame';
import RelatedGamesList from './RelatedGamesList';
import styles from '../jeu.module.css';

interface Props {
  relatedGames: SanityGameSummary[];
}

const RelatedGames = ({ relatedGames }: Props) => {
  return (
    <>
      <div className="container">
        <h2 className={styles.titleSecondary}>D&apos;autres jeux à terminer</h2>
      </div>
      <RelatedGamesList relatedGames={relatedGames} />
    </>
  );
};

export default RelatedGames;
