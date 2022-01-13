import { FC, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styled from '@emotion/styled';
import Overlay from '@/assets/Overlay';
import { Game } from '@prisma/client';

const StyleLayout = styled(`div`)``;

interface Props {
  children: React.ReactNode;
}

const LayoutAdmin: FC<Props> = ({ children }: Props) => {
  return (
    <StyleLayout className="container">
      <Header />
      <main>{children}</main>
    </StyleLayout>
  );
};

export default LayoutAdmin;
