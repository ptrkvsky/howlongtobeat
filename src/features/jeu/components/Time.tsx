import { Game } from '@prisma/client';
import { Description } from '../styles/Description';

interface Props {
  game: Game;
}

const Time = ({ game }: Props) => {
  return (
    <>
      {game.timeMainStory && (
        <Description>
          Pour terminer l&apos;histoire principale de{` `}
          <span className="primary-color bold">{game.name}</span> il faut
          compter environ{` `}
          <span className="primary-color bold">
            {game.timeMainStory} heures.
          </span>
          .
        </Description>
      )}
      {game.timeAllStyles && (
        <Description>
          En moyenne, pour terminer
          <span className="primary-color bold">{game.name}</span>,
          l&apos;ensemble des joueurs a mis{` `}
          {game.timeAllStyles} heures.
        </Description>
      )}
      {game.timeCompletionists && (
        <Description>
          Si vous êtes un acharné de la manette, pour terminer le jeu{` `}
          <span className="primary-color bold">100%</span> il vous faudra
          environ
          <span className="primary-color bold">
            {game.timeAllStyles} heures.
          </span>
        </Description>
      )}
    </>
  );
};

export default Time;