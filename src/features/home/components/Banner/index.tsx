import banner from '@/assets/bg.jpg';

import Image from 'next/image';
import { WrapperImage, Title, Wrapper } from './style';

interface Props {
  countGames: number;
}

const Banner = ({ countGames }: Props) => {
  return (
    <Wrapper>
      <div className="container">
        <Title className="title">
          Quelle est la durée de vie de mes{` `}
          <span className="highlight">jeux favoris</span> ?
        </Title>
        <div className="description">
          Vous souhaitez savoir le temps nécessaire pour arriver au boutde votre
          dernier jeu ? Game-over recense aujourd’hui plus de{` `}
          <span className="highlight">{countGames} jeux</span>.<br /> Action,
          aventure, RPG, tous les genres sont représentés. Votre jeu ne se
          trouve pas dans la liste ? Enregistrez-vous et ajouter le facilement à
          notre base de données.
        </div>
      </div>
      <WrapperImage className="wrapper-image">
        <Image
          priority
          alt="Illustration jeux video"
          src={banner}
          layout="fill"
          objectFit="cover"
        />
      </WrapperImage>
    </Wrapper>
  );
};

export default Banner;
