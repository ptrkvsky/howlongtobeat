import { Game } from '@prisma/client';
import Link from 'next/link';
import Cover from '../../Cover';
import { Marquee, Wrapper, SpanLink } from './style';

interface Props {
  relatedGame: Game;
}

const RelatedGamesItem = ({ relatedGame }: Props) => {
  return (
    <div className="menu__item">
      <div className="menu__item-link">
        <Link href={`/jeu/${relatedGame.id}`}>
          <a>{relatedGame.name}</a>
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
