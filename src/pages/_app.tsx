import { AppProps } from 'next/app';
import DarkModeProvider from '@/context/DarkModeContext';
import StyleContainer from '@/styles/containers/StyleContainer';
import Script from 'next/script';

export default function MyApp({ Component, pageProps }: AppProps) {
  const styles = [
    `color: white`,
    `background: hotpink`,
    `font-size: 32px`,
    `padding: 6px 8px`,
  ].join(`;`);
  const message = `GAME-OVER.IO`;

  // eslint-disable-next-line no-console
  console.info(`%c%s`, styles, message);

  return (
    <>
      {/* Global site tag (gtag.js) - Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.GA}');
        `}
      </Script>
      <DarkModeProvider>
        <StyleContainer>
          <Component {...pageProps} />
        </StyleContainer>
      </DarkModeProvider>
    </>
  );
}
