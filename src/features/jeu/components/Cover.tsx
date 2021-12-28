import { breakpoints } from '@/styles/foundations';
import styled from '@emotion/styled';
import { Game } from '@prisma/client';
import Image from 'next/image';

interface Props {
  game: Game;
}

const Wrapper = styled(`div`)`
  position: relative;
  width: 352px;
  height: 469px;
`;

const Cover = ({ game }: Props) => {
  return (
    <Wrapper>
      <Image
        priority
        alt={game.name}
        src={`https:${game.cover}`}
        layout="responsive"
        width={352}
        height={469}
      />
    </Wrapper>
  );
};

export default Cover;
