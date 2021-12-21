import styled from '@emotion/styled';
import DarkModeButton from '../DarkModeButton';

const StyledHeader = styled(`header`)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px dashed #fff6e6;
  height: 67px;
`;

const Header = () => {
  return (
    <StyledHeader>
      <div className="container">
        Logo
        <DarkModeButton />
      </div>
    </StyledHeader>
  );
};

export default Header;
