import { useContext, FC, PropsWithChildren } from 'react';
import { DarkModeContext } from '@/context/DarkModeContext';

import { DarkModeContextType } from '@/context/types';
import { ThemeProvider } from '@emotion/react';
import GlobalStyles from '../GlobalStyles';
import { darkTheme, lightTheme, baseTheme } from '../theme';

const StyleContainer: FC<PropsWithChildren> = ({ children }) => {
  const { mode } = useContext(DarkModeContext) as DarkModeContextType;

  const toggleTheme = mode === `DARK` ? darkTheme : lightTheme;

  const theme = {
    ...baseTheme,
    ...toggleTheme,
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />

      <div className={mode === `DARK` ? `theme-dark` : `theme-light`}>
        {children}
      </div>
    </ThemeProvider>
  );
};

export default StyleContainer;
