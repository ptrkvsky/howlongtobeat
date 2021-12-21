import { useContext } from 'react';
import { ToggleModeButton } from './style';
import { DarkModeContext } from '@/context/DarkModeContext';
import { DarkModeContextType } from '@/context/types';

const DarkModeButton = () => {
  const { toggleMode, mode } = useContext(
    DarkModeContext,
  ) as DarkModeContextType;

  return (
    <ToggleModeButton type="button" onClick={() => toggleMode()}>
      {`${mode === `DARK` ? `🌙` : `☀️`}`}
    </ToggleModeButton>
  );
};

export default DarkModeButton;
