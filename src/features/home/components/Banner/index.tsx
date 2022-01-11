import banner from '@/assets/banner_home.jpg';
import { TitleMain } from '@/features/jeu/styles';
import styled from '@emotion/styled';
import { Game } from '@prisma/client';
import Image from 'next/image';

const Wrapper = styled(`div`)`
  display: block;
  position: relative;
  height: 80vh;
  .title {
    position: absolute;
    top: 25vh;
    z-index: 10;
    color: #fff;
    margin: 0;
    margin-bottom: ${({ theme }) => theme.spacing[6]};
  }
  .description {
    position: absolute;
    z-index: 10;
    top: calc(25vh + 3rem);
    p {
      margin: ${({ theme }) => theme.spacing[3]} 0;
      color: #fff;
      font-size: ${({ theme }) => theme.typography.fontSizes[`2xl`]};
    }
  }
`;

interface Props {
  countGames: number;
}

const Banner = ({ countGames }: Props) => {
  return (
    <Wrapper>
      <div className="container">
        <TitleMain className="title">game-over.io</TitleMain>
        <div className="description">
          <p>Découvrez la durée de vie de vos jeux-vidéos favoris.</p>
          <p>
            Déja plus de <span className="bold">{countGames}</span> jeux dans
            notre base de données
          </p>
        </div>
      </div>
      <Image
        priority
        alt="Illustration jeux video"
        src={banner}
        layout="fill"
        objectFit="cover"
      />
    </Wrapper>
  );
};

export default Banner;
