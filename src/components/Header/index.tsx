import styled from '@emotion/styled';
import DarkModeButton from '../DarkModeButton';
import { styleInformations } from '@/config/styleInformations';
import Logo from '../Logo';

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

const Header = () => {
  return (
    <StyledHeader>
      <div className="container">
        <Logo />

        <DarkModeButton />
      </div>
    </StyledHeader>
  );
};

export default Header;
