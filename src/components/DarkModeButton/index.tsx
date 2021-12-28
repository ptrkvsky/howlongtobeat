import { RefObject, useContext, useState } from 'react';
import gsap from 'gsap';
import { ToggleModeButton } from './style';
import { DarkModeContext } from '@/context/DarkModeContext';
import { DarkModeContextType } from '@/context/types';
import { useTheme } from '@emotion/react';

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
      gsap
        .timeline({
          onComplete: () => setIsAnimating(false),
        })
        .set(refOverlay.current, {
          fill: theme.colors.primary[500],
        })
        .set(refOverlay.current, {
          attr: { d: `M 0 100 V 100 Q 50 100 100 100 V 100 z` },
        })
        .to(
          refOverlay.current,
          {
            duration: 0.8,
            ease: `power4.in`,
            attr: { d: `M 0 100 V 50 Q 50 0 100 50 V 100 z` },
          },
          0,
        )
        .to(refOverlay.current, {
          duration: 0.3,
          ease: `power2`,
          attr: { d: `M 0 100 V 0 Q 50 0 100 0 V 100 z` },
          onComplete: () => toggleMode(),
        })
        // now reveal
        .set(refOverlay.current, {
          attr: { d: `M 0 0 V 100 Q 50 100 100 100 V 0 z` },
        })
        .to(refOverlay.current, {
          duration: 0.3,
          ease: `power2.in`,
          attr: { d: `M 0 0 V 50 Q 50 0 100 50 V 0 z` },
        })
        .to(refOverlay.current, {
          duration: 0.8,
          ease: `power4`,
          attr: { d: `M 0 0 V 0 Q 50 0 100 0 V 0 z` },
        });
    } else {
      gsap
        .timeline({
          onComplete: () => setIsAnimating(false),
        })
        .set(refOverlay.current, {
          fill: theme.colors.primary[500],
        })
        .set(refOverlay.current, {
          attr: { d: `M 0 0 V 0 Q 50 0 100 0 V 0 z` },
        })
        .to(
          refOverlay.current,
          {
            duration: 0.8,
            ease: `power4.in`,
            attr: { d: `M 0 0 V 50 Q 50 100 100 50 V 0 z` },
          },
          0,
        )
        .to(refOverlay.current, {
          duration: 0.3,
          ease: `power2`,
          attr: { d: `M 0 0 V 100 Q 50 100 100 100 V 0 z` },
          onComplete: () => toggleMode(),
        })
        // now reveal
        .set(refOverlay.current, {
          attr: { d: `M 0 100 V 0 Q 50 0 100 0 V 100 z` },
        })
        .to(refOverlay.current, {
          duration: 0.3,
          ease: `power2.in`,
          attr: { d: `M 0 100 V 50 Q 50 100 100 50 V 100 z` },
        })
        .to(refOverlay.current, {
          duration: 0.8,
          ease: `power4`,
          attr: { d: `M 0 100 V 100 Q 50 100 100 100 V 100 z` },
        });
    }
  };

  return (
    <ToggleModeButton type="button" onClick={() => handleClick()}>
      {`${mode === `DARK` ? `🌙` : `☀️`}`}
    </ToggleModeButton>
  );
};

export default DarkModeButton;
