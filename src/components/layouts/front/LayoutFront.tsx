import { FC, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styled from '@emotion/styled';
import Overlay from '@/assets/Overlay';
import { Game } from '@prisma/client';

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

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    pointer-events: none;
    width: 100%;
    height: 100%;
  }
`;

interface Props {
  children: React.ReactNode;
  cloakFooter?: boolean;
  isCentered?: boolean;
}

const LayoutFront: FC<Props> = ({
  children,
  cloakFooter,
  isCentered,
}: Props) => {
  const refOverlay = useRef<SVGPathElement>(null);

  return (
    <StyleLayout className={`${isCentered ? `container` : ``}`}>
      <main>{children}</main>
      <Header refOverlay={refOverlay} />
      <Footer cloakFooter={cloakFooter} />
      <Overlay refOverlay={refOverlay} />
    </StyleLayout>
  );
};

export default LayoutFront;
