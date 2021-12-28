import banner from '@/assets/banner_home.jpg';
import { TitleMain } from '@/features/jeu/styles';
import styled from '@emotion/styled';
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
  }
  .description {
    color: #fff;
    position: absolute;
    z-index: 10;
    top: calc(25vh + 3rem);
    font-size: ${({ theme }) => theme.typography.fontSizes[`2xl`]};
  }
`;

const Banner = () => {
  return (
    <Wrapper>
      <div className="container">
        <TitleMain className="title">game-over.io</TitleMain>
        <p className="description">
          Découvrez la durée de vie de vos jeux-vidéos favoris.
        </p>
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
