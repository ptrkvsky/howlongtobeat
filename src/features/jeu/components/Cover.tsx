import { SanityGameSummary } from '@/types/sanity/SanityGame';
import styled from '@emotion/styled';
import Image from 'next/image';

interface Props {
  game: SanityGameSummary;
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
        width={352}
        height={469}
        sizes="352px"
        style={{ width: `100%`, height: `auto` }}
      />
    </Wrapper>
  );
};

export default Cover;
