import compareGames from '@/functions/generic/compare';
import { Game } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { TitleSecondary } from '../../styles/TitleSecondary';
import Cover from '../Cover';
import RelatedGamesList from './RelatedGamesList';

interface Props {
  relatedGames: Game[];
}

const RelatedGames = ({ relatedGames }: Props) => {
  relatedGames.sort(compareGames);
  return (
    <>
      <TitleSecondary>D&apos;autres jeux à terminer</TitleSecondary>
      <RelatedGamesList relatedGames={relatedGames} />
    </>
  );
};

export default RelatedGames;
