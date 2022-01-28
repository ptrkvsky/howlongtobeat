import styled from '@emotion/styled';
import DarkModeButton from '../DarkModeButton';
import { styleInformations } from '@/config/styleInformations';
import Logo from '../Logo';
import { RefObject } from 'react';
import { SearchGames } from '@/components/searchGames';

const StyledHeader = styled(`header`)`
  position: relative;
  z-index: 20;
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
  refOverlay?: RefObject<SVGPathElement>;
  isAdmin?: boolean;
}

const Header = ({ refOverlay, isAdmin = false }: Props) => {
  return (
    <StyledHeader>
      <div className="container">
        <Logo />
        <SearchGames isAdmin={isAdmin} />
        {refOverlay && <DarkModeButton refOverlay={refOverlay} />}
      </div>
    </StyledHeader>
  );
};

export default Header;
