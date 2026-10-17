import { SanityGame } from '@/types/sanity/SanityGame';
import styles from './jeu.module.css';

interface Props {
  game: SanityGame;
}

const Time = ({ game }: Props) => {
  return (
    <>
      {game.timeMainStory > 0 && (
        <div className={styles.description}>
          Pour terminer{` `}
          <span className="primary-color bold">l&apos;histoire principale</span>
          {` `} de {game.name} il faut compter environ{` `}
          <span className="primary-color bold">
            {game.timeMainStory} heures.
          </span>
        </div>
      )}

      {game.timeMainExtras > 0 && (
        <div className={styles.description}>
          Pour terminer{` `}
          <span className="primary-color bold">
            {game.name} et faire quelques extras
          </span>
          {` `}
          c&apos;est environ {` `}
          <span className="primary-color bold">
            {game.timeMainExtras} heures
          </span>
          {` `}
          qu&apos;il faudra compter
        </div>
      )}

      {game.timeCompletionists > 0 && (
        <div className={styles.description}>
          Si vous êtes un acharné de la manette, pour terminer le jeu{` `}
          <span className="primary-color bold">100%</span> il vous faudra
          environ{` `}
          <span className="primary-color bold">
            {game.timeCompletionists} heures.
          </span>
        </div>
      )}
    </>
  );
};

export default Time;
