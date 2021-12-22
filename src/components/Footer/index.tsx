import styled from '@emotion/styled';
import { styleInformations } from '@/config/styleInformations';
import Logo from '../Logo';

const StyleFooter = styled(`footer`)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${styleInformations.headerHeight.dekstop};
`;

const Footer = () => {
  return (
    <StyleFooter className="container">
      <Logo />
    </StyleFooter>
  );
};

export default Footer;
