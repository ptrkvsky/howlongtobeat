import { RefObject, useContext, useState } from 'react';
import { ToggleModeButton } from './style';
import { DarkModeContext } from '@/context/DarkModeContext';
import { DarkModeContextType } from '@/context/types';
import { useTheme } from '@emotion/react';
import { animateLight, animateDark } from './animate';

interface Props {
  refOverlay: RefObject<SVGPathElement>;
}

const DarkModeButton = ({ refOverlay }: Props) => {
  const theme = useTheme();
  const { toggleMode, mode } = useContext(
    DarkModeContext,
  ) as DarkModeContextType;

  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    if (mode === `DARK`) {
      animateLight(setIsAnimating, refOverlay, theme, toggleMode);
    } else {
      animateDark(setIsAnimating, refOverlay, theme, toggleMode);
    }
  };

  return (
    <ToggleModeButton
      isDark={mode === `DARK`}
      styleColor={theme.colors.text}
      type="button"
      onClick={() => handleClick()}
      aria-label="Changement de theme"
    >
      <div className="moon-or-sun" />
      <div className="moon-mask" />
    </ToggleModeButton>
  );
};

export default DarkModeButton;
