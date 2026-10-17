import PortableText from '@/components/Sanity/PortableText';
import Layout from '@/components/layouts/front/LayoutFront';
import { SanityGame, SanityGameSummary } from '@/types/sanity/SanityGame';
import Banner from './Banner/Banner';
import CircularBar from './CircularBar';
import Cover from './Cover';
import RelatedGames from './RelatedGames';
import Time from './Time';
import styles from './jeu.module.css';

interface Props {
  game: SanityGame;
  relatedGames: SanityGameSummary[];
}

const TemplateJeu = ({ game, relatedGames }: Props) => {
  return (
    <Layout>
      {game.cover && <Banner game={game} />}

      <div className={`container ${styles.content}`}>
        <div className={styles.cover}>
          {game.cover && <Cover game={game} priority />}
        </div>
        {game.rating && <CircularBar percentage={game.rating} />}
        <div>
          <h1 className={styles.titleMain}>
            Combien de temps faut-il pour terminer <br />
            <span className={styles.name}>{game.name}</span> ?
          </h1>
          <div className={styles.description}>
            <PortableText blocks={game.description} />
          </div>
          <Time game={game} />
        </div>
      </div>
      <div className="container">
        <RelatedGames relatedGames={relatedGames} />
      </div>
    </Layout>
  );
};

export default TemplateJeu;
