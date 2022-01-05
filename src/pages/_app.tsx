import { useEffect } from 'react';
import { AppProps } from 'next/app';
import TagManager from 'react-gtm-module';
import DarkModeProvider from '@/context/DarkModeContext';
import StyleContainer from '@/styles/containers/StyleContainer';
import { siteInformations } from '@/config/siteInformations';

export default function MyApp({ Component, pageProps }: AppProps) {
  const styles = [
    `color: white`,
    `background: #1a1a1a`,
    `font-size: 64px`,
    `font-family: white`,
    `padding: 6px 8px`,
  ].join(`;`);
  const message = `GAME-OVER.IO`;

  // eslint-disable-next-line no-console
  console.info(`%c%s`, styles, message);

  useEffect(() => {
    TagManager.initialize({ gtmId: siteInformations.tagManager });
  }, []);

  return (
    <>
      <DarkModeProvider>
        <StyleContainer>
          <Component {...pageProps} />
        </StyleContainer>
      </DarkModeProvider>
    </>
  );
}
