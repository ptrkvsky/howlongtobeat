import { SanityGame } from '@/types/sanity/SanityGame';
import { Game } from '@prisma/client';
import RelatedGamesItem from '../RelatedGamesItem';

interface Props {
  relatedGames: SanityGame[];
}

const RelatedGamesList = ({ relatedGames }: Props) => {
  return (
    <nav className="menu">
      {relatedGames.map((relatedGame) => (
        <RelatedGamesItem key={relatedGame._id} relatedGame={relatedGame} />
      ))}
    </nav>
  );
};

export default RelatedGamesList;
