import Image from 'next/image';
import Link from 'next/link';
import { WrapperImage, Title, Wrapper } from './style';
import banner from '@/assets/bg.jpg';

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
          <Link href="/plan-du-site" className="highlight">
            {` `}
            {countGames} jeux
          </Link>
          .<br /> Action, aventure, RPG, tous les genres sont représentés. Votre
          jeu ne se trouve pas dans la liste ? Enregistrez-vous et ajouter le
          facilement à notre base de données.
        </div>
      </div>
      <WrapperImage className={`wrapper-image`}>
        <Image
          priority
          alt="Illustration jeux video"
          src={banner}
          fill
          sizes="100vw"
          placeholder="blur"
          style={{ objectFit: `cover` }}
        />
      </WrapperImage>
    </Wrapper>
  );
};

export default Banner;
