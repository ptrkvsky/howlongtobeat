import { SanityGame } from '@/types/sanity/SanityGame';
import { Description } from '../styles/Description';

interface Props {
  game: SanityGame;
}

const Time = ({ game }: Props) => {
  return (
    <>
      {game.timeMainStory && (
        <Description>
          Pour terminer{` `}
          <span className="primary-color bold">l&apos;histoire principale</span>
          {` `} de {game.name} il faut compter environ{` `}
          <span className="primary-color bold">
            {game.timeMainStory} heures.
          </span>
        </Description>
      )}

      {game.timeMainExtras && (
        <Description>
          Pour terminer{` `}
          <span className="primary-color bold">
            {game.name} et faire quelques extras
          </span>
          {` `}
          c&apos;est environ {` `}
          <span className="primary-color bold">
            {game.timeMainStory} heures.
          </span>
          {` `}
          qu&apos;il faudra compter
        </Description>
      )}

      {game.timeCompletionists && (
        <Description>
          Si vous êtes un acharné de la manette, pour terminer le jeu{` `}
          <span className="primary-color bold">100%</span> il vous faudra
          environ{` `}
          <span className="primary-color bold">
            {game.timeCompletionists} heures.
          </span>
        </Description>
      )}
    </>
  );
};

export default Time;
