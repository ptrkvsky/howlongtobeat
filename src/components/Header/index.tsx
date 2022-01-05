import styled from '@emotion/styled';
import DarkModeButton from '../DarkModeButton';
import { styleInformations } from '@/config/styleInformations';
import Logo from '../Logo';
import { RefObject } from 'react';
import { Game } from '@prisma/client';
import { SearchGames } from '@/components/searchGames';

const StyledHeader = styled(`header`)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${styleInformations.headerHeight.dekstop};

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

interface Props {
  refOverlay: RefObject<SVGPathElement>;
  games: Game[];
}

const Header = ({ refOverlay, games }: Props) => {
  return (
    <StyledHeader>
      <div className="container">
        <Logo />
        {games.length > 0 && <SearchGames games={games} />}
        <DarkModeButton refOverlay={refOverlay} />
      </div>
    </StyledHeader>
  );
};

export default Header;
