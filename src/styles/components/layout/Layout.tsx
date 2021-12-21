import { FC } from 'react';
import Header from '@/components/Header';
import { ContainerMain } from '@/styles/components/containers';

const Layout: FC = ({ children }) => (
  <>
    <Header />
    <ContainerMain as="main">{children}</ContainerMain>
  </>
);

export default Layout;
