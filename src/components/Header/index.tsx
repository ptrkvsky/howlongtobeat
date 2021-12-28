import styled from '@emotion/styled';
import DarkModeButton from '../DarkModeButton';
import { styleInformations } from '@/config/styleInformations';
import Logo from '../Logo';
import { RefObject } from 'react';

const StyledHeader = styled(`header`)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${styleInformations.headerHeight.dekstop};

  .container {
    display: flex;
    justify-content: space-between;
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
        <DarkModeButton refOverlay={refOverlay} />
      </div>
    </StyledHeader>
  );
};

export default Header;
