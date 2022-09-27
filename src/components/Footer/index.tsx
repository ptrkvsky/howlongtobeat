import { FC } from 'react';
import { StyleFooter } from './style';
import LinkSitemap from './Links';
import Logo from '../Logo';

interface Props {
  cloakFooter?: boolean;
}

const Footer: FC<Props> = ({ cloakFooter }) => {
  return (
    <StyleFooter className="container">
      {/* <Logo /> */}
      <LinkSitemap cloakFooter={cloakFooter} />
    </StyleFooter>
  );
};

export default Footer;
