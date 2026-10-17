import Link from 'next/link';
import { FC } from 'react';
import urls from '@/config/urls';
import CloakLink from '@/components/Cloaklink';
import styles from '../footer.module.css';

interface Props {
  cloakFooter?: boolean;
}

const LinkSitemap: FC<Props> = ({ cloakFooter = true }: Props) => {
  if (!cloakFooter) {
    return (
      <div className={styles.links}>
        <Link href={urls.plan}>Plan du site</Link>
        <span className={styles.separator}>/</span>
        <Link href={urls.mentions}>Mentions légales</Link>
        <span className={styles.separator}>/</span>
        <Link href={urls.politique}>Politique de confidentialité</Link>
      </div>
    );
  } else {
    return (
      <div className={styles.links}>
        <CloakLink url={urls.plan}>Plan du site</CloakLink>
        {` `}
        <span className={styles.separator}>/</span>
        <CloakLink url={urls.mentions}>Mentions légales</CloakLink>
        {` `}
        <span className={styles.separator}>/</span>
        <CloakLink url={urls.politique}>Politique de confidentialité</CloakLink>
      </div>
    );
  }
};

export default LinkSitemap;
