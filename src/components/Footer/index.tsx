import { FC } from 'react';
import LinkSitemap from './Links';
import styles from './footer.module.css';

interface Props {
  cloakFooter?: boolean;
}

const Footer: FC<Props> = ({ cloakFooter }) => {
  return (
    <footer className={`container ${styles.footer}`}>
      <LinkSitemap cloakFooter={cloakFooter} />
    </footer>
  );
};

export default Footer;
