import Link from 'next/link';
import { FC } from 'react';
import styled from '@emotion/styled';
import CloakLink from '../Cloaklink';

const StyleLink = styled(Link)``;
interface Props {
  cloakFooter?: boolean;
}

const LinkSitemap: FC<Props> = ({ cloakFooter }: Props) => {
  if (!cloakFooter) {
    return (
      <StyleLink href={`/sitemap`}>
        <a>Plan du site</a>
      </StyleLink>
    );
  } else {
    return <CloakLink url="/sitemap">Plan du site</CloakLink>;
  }
};

export default LinkSitemap;
