import { Theme } from '@emotion/react';
import { gsap } from 'gsap';
import { RefObject, SetStateAction } from 'react';

const animateLight = (
  setIsAnimating: (value: SetStateAction<boolean>) => void,
  refOverlay: RefObject<SVGPathElement>,
  theme: Theme,
  toggleMode: () => void,
) => {
  const body = document.querySelector(`main`);

  if (!body) return null;
  gsap
    .timeline({
      onStart: () => {
        body.style.filter = `blur 5px`;
      },
      onComplete: () => {
        body.style.filter = `blur 0px`;
        setIsAnimating(false);
      },
    })
    .set(refOverlay.current, {
      fill: theme.colors.primary[500],
    })
    .set(refOverlay.current, {
      attr: { d: `M 0 100 V 100 Q 50 100 100 100 V 100 z` },
    })
    .to(`body`, {
      duration: 0.8,
      ease: `none`,
      blur: 8,
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
};

const animateDark = (
  setIsAnimating: (value: SetStateAction<boolean>) => void,
  refOverlay: RefObject<SVGPathElement>,
  theme: Theme,
  toggleMode: () => void,
) => {
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
};

export { animateLight, animateDark };
