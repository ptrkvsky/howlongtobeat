import { PropsWithChildren } from 'react';
import styles from './titles.module.css';

export const HomeTitle = ({ children }: PropsWithChildren) => (
  <h1 className={styles.homeTitle}>{children}</h1>
);

export const List = ({ children }: PropsWithChildren) => (
  <ul className={styles.list}>{children}</ul>
);
