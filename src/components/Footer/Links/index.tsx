import Link from 'next/link';
import { FC } from 'react';
import styled from '@emotion/styled';
import urls from '@/config/urls';
import CloakLink from '@/components/Cloaklink';
import { breakpoints } from '@/styles/foundations';

const WrapperLinks = styled(`div`)`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[2]};
  * {
    .theme-light & {
      color: ${({ theme }) => theme.colors.gray[700]};
    }
    .theme-dark & {
      color: ${({ theme }) => theme.colors.gray[200]};
    }
    &:hover {
      color: ${({ theme }) => theme.colors.primary[500]};
    }
  }

  ${breakpoints.tabletPortrait} {
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .separator {
      display: none;
    }
  }
`;
interface Props {
  cloakFooter?: boolean;
}

const LinkSitemap: FC<Props> = ({ cloakFooter = true }: Props) => {
  if (!cloakFooter) {
    return (
      <WrapperLinks>
        <Link href={urls.plan}>Plan du site</Link>
        <span className="separator">/</span>
        <Link href={urls.mentions}>Mentions légales</Link>
        <span className="separator">/</span>
        <Link href={urls.politique}>Politique de confidentialité</Link>
      </WrapperLinks>
    );
  } else {
    return (
      <WrapperLinks>
        <CloakLink url={urls.plan}>Plan du site</CloakLink>
        {` `}
        <span className="separator">/</span>
        <CloakLink url={urls.mentions}>Mentions légales</CloakLink>
        {` `}
        <span className="separator">/</span>
        <CloakLink url={urls.politique}>Politique de confidentialité</CloakLink>
      </WrapperLinks>
    );
  }
};

export default LinkSitemap;
