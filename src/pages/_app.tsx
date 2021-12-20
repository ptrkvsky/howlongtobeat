import { AppProps } from 'next/app';
import { ToggleModeButton } from '@/styles/components/buttons/ToggleModeButton';
import Layout from '@/styles/components/layout/Layout';
import GlobalStyles from '@/styles/GlobalStyles';
import { baseTheme, lightTheme, darkTheme } from '@/styles/theme';
import { ThemeProvider } from '@emotion/react';
import { useState, useEffect } from 'react';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [isDark, setIsDark] = useState<boolean>(false);
  useEffect(() => {
    setIsDark(window.matchMedia(`(prefers-color-scheme: dark)`).matches);
  }, []);

  const toggleTheme = isDark ? darkTheme : lightTheme;

  const theme = {
    ...baseTheme,
    ...toggleTheme,
  };

  const handleClick = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />

      <div className={isDark ? `theme-dark` : `theme-light`}>
        <Layout>
          <Component {...pageProps} />
          <ToggleModeButton type="button" onClick={handleClick}>
            {`${isDark ? `🌙` : `☀️`}`}
          </ToggleModeButton>
        </Layout>
      </div>
    </ThemeProvider>
  );
}
