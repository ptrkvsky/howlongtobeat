import compareGames from '@/functions/generic/compare';
import { Game } from '@prisma/client';
import { TitleSecondary } from '../../styles/TitleSecondary';
import RelatedGamesList from './RelatedGamesList';

interface Props {
  relatedGames: Game[];
}

const RelatedGames = ({ relatedGames }: Props) => {
  relatedGames.sort(compareGames);
  return (
    <>
      <div className="container">
        <TitleSecondary>D&apos;autres jeux à terminer</TitleSecondary>
      </div>
      <RelatedGamesList relatedGames={relatedGames} />
    </>
  );
};

export default RelatedGames;
