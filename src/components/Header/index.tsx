import styled from '@emotion/styled';
import DarkModeButton from '../DarkModeButton';
import { styleInformations } from '@/config/styleInformations';
import Logo from '../Logo';
import { RefObject, useEffect, useState } from 'react';
import { Game } from '@prisma/client';
import { SearchGames } from '@/components/searchGames';
import games from '@/pages/api/client/games';
import { url } from 'inspector';

const StyledHeader = styled(`header`)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${styleInformations.headerHeight.dekstop};

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;

    ${({ theme }) => theme.breakpoints.mobile} {
      flex-direction: column;
    }
  }

  ${({ theme }) => theme.breakpoints.mobile} {
    flex-direction: column;
    height: ${styleInformations.headerHeight.mobile};
  }
`;

interface Props {
  refOverlay: RefObject<SVGPathElement>;
}

const Header = ({ refOverlay }: Props) => {
  return (
    <StyledHeader>
      <div className="container">
        <Logo />
        <SearchGames />
        <DarkModeButton refOverlay={refOverlay} />
      </div>
    </StyledHeader>
  );
};

export default Header;
