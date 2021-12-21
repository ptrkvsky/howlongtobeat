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
    min-height: calc(100vh - 134px);
    padding: ${({ theme }) => theme.spacing[8]} 0;
  }
  header {
    grid-area: header;
  }
  footer {
    grid-area: footer;
  }
`;

const Layout: FC = ({ children }) => (
  <StyleLayout>
    <main className="container">{children}</main>
    <Header />
    <Footer />
  </StyleLayout>
);

export default Layout;
