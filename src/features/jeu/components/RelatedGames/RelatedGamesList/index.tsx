import { Game } from '@prisma/client';
import RelatedGamesItem from '../RelatedGamesItem';

interface Props {
  relatedGames: Game[];
}

const RelatedGamesList = ({ relatedGames }: Props) => {
  return (
    <nav className="menu">
      {relatedGames.map((relatedGame) => (
        <RelatedGamesItem key={relatedGame.id} relatedGame={relatedGame} />
      ))}
    </nav>
  );
};

export default RelatedGamesList;
