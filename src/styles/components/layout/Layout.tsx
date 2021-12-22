import { FC } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styled from '@emotion/styled';
import { styleInformations } from '@/config/styleInformations';

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
    margin-top: ${({ theme }) => theme.spacing[8]};
    grid-area: footer;
  }
`;

const Layout: FC = ({ children }) => (
  <StyleLayout>
    <main>{children}</main>
    <Header />
    <Footer />
  </StyleLayout>
);

export default Layout;
