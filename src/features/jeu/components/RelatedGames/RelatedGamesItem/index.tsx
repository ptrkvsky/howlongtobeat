import { SanityGameSummary } from '@/types/sanity/SanityGame';
import Link from 'next/link';
import Cover from '../../Cover';
interface Props {
  relatedGame: SanityGameSummary;
}

const RelatedGamesItem = ({ relatedGame }: Props) => {
  return (
    <div className="menu__item">
      <div className="menu__item-link">
        <Link href={`/jeu/${relatedGame.slug.current}`}>
          {relatedGame.name}
        </Link>
      </div>
      <div className="menu__item-img">
        {relatedGame.cover && <Cover game={relatedGame} />}
      </div>
      <div className="marquee">
        <div className="marquee__inner" aria-hidden="true">
          <span>{relatedGame.name}</span>
          <span>{relatedGame.name}</span>
          <span>{relatedGame.name}</span>
          <span>{relatedGame.name}</span>
        </div>
      </div>
    </div>
  );
};

export default RelatedGamesItem;
