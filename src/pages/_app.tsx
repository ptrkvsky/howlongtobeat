import { AppProps } from 'next/app';
import DarkModeProvider from '@/context/DarkModeContext';
import StyleContainer from '@/styles/containers/StyleContainer';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DarkModeProvider>
      <StyleContainer>
        <Component {...pageProps} />
      </StyleContainer>
    </DarkModeProvider>
  );
}
