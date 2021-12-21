import styled from '@emotion/styled';

import { siteInformations } from '@/config/siteInformations';

const StyleFooter = styled(`footer`)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px dashed #fff6e6;
  height: 67px;
`;

const Footer = () => {
  return (
    <StyleFooter>
      <div className="container">{siteInformations.title}</div>
    </StyleFooter>
  );
};

export default Footer;
