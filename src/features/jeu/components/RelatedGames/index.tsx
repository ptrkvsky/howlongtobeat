import compareGames from '@/functions/generic/compare';
import { SanityGame } from '@/types/sanity/SanityGame';
import { TitleSecondary } from '../../styles/TitleSecondary';
import RelatedGamesList from './RelatedGamesList';

interface Props {
  relatedGames: SanityGame[];
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
