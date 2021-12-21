import { AppProps } from 'next/app';
import Layout from '@/styles/components/layout/Layout';
import DarkModeProvider from '@/context/DarkModeContext';

import StyleContainer from '@/styles/containers/StyleContainer';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DarkModeProvider>
      <StyleContainer>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </StyleContainer>
    </DarkModeProvider>
  );
}
