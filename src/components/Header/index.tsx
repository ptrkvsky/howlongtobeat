import Link from 'next/link';
import styled from '@emotion/styled';
import DarkModeButton from '../DarkModeButton';

const StyledHeader = styled(`header`)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  height: 67px;

  .container {
    display: flex;
    justify-content: space-between;
  }
`;

const Header = () => {
  return (
    <StyledHeader>
      <div className="container">
        <Link href="/">Logo</Link>
        <DarkModeButton />
      </div>
    </StyledHeader>
  );
};

export default Header;
