import { Game } from '@prisma/client';
import Image from 'next/image';
import { TitleMain } from '../styles';
import { Description } from '../styles/Description';

interface Props {
  game: Game;
}

const TemplateJeu = ({ game }: Props) => {
  return (
    <>
      <TitleMain>
        Combien de temps faut-il pour terminer <br />
        <span className="name">{game.name}</span> ?
      </TitleMain>
      {game.cover && (
        <Image
          priority
          alt={game.name}
          src={`https:${game.cover}`}
          layout="responsive"
          width={540}
          height={720}
        />
      )}

      <Description>{game.description}</Description>
      <Description>
        Pour terminer l&apos;histoire principale de{` `}
        <span className="primary-color bold">{game.name}</span> il faut compter
        environ {game.timeMainStory} heures
      </Description>
    </>
  );
};

export default TemplateJeu;
