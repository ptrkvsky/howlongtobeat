import { createContext, useState, FC, useEffect } from 'react';
import { Mode, DarkModeContextType } from './types';

const initialState: Mode = `DARK`;

const initialContext: DarkModeContextType = {
  mode: `DARK`,
  toggleMode: () => {
    console.log(`ok`);
  },
};

export const DarkModeContext =
  createContext<DarkModeContextType>(initialContext);

const DarkModeProvider: FC = ({ children }) => {
  const [mode, setMode] = useState<Mode>(initialState);

  useEffect(() => {
    setMode(
      window.matchMedia(`(prefers-color-scheme: dark)`).matches
        ? `DARK`
        : `LIGHT`,
    );
  }, []);

  const toggleMode = () => {
    if (mode === `DARK`) {
      setMode(`LIGHT`);
    } else {
      setMode(`DARK`);
    }
  };

  return (
    <DarkModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export default DarkModeProvider;
