'use client';

import { useEffect } from 'react';

const styles = [
  `color: white`,
  `background: #1a1a1a`,
  `font-size: 64px`,
  `font-family: white`,
  `padding: 6px 8px`,
].join(`;`);

const ConsoleBanner = () => {
  useEffect(() => {
    console.info(`%c%s`, styles, `GAME-OVER.IO`);
  }, []);

  return null;
};

export default ConsoleBanner;
