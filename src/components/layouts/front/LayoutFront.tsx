import { FC } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './layoutFront.module.css';

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
  return (
    <div className={`${styles.layout} ${isCentered ? `container` : ``}`}>
      <main>{children}</main>
      <Header />
      <Footer cloakFooter={cloakFooter} />
    </div>
  );
};

export default LayoutFront;
