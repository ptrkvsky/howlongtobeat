import { FC } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styled from '@emotion/styled';

const StyleLayout = styled(`div`)`
  display: grid;
  grid-template-areas:
    'header'
    'main'
    'footer';

  main {
    grid-area: main;
    min-height: calc(100vh - 170px);
  }
  header {
    grid-area: header;
  }
  footer {
    grid-area: footer;
  }
`;

interface Props {
  children: React.ReactNode;
  cloakFooter?: boolean;
  isCentered?: boolean;
}

const Layout: FC<Props> = ({ children, cloakFooter, isCentered }: Props) => (
  <StyleLayout className={`${isCentered ? `container` : ``}`}>
    <main>{children}</main>
    <Header />
    <Footer cloakFooter={cloakFooter} />
  </StyleLayout>
);

export default Layout;
