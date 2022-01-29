import gsap from 'gsap';
import { RefObject } from 'react';

export const transition = (
  preloader: RefObject<HTMLDivElement>,
  template: RefObject<HTMLDivElement>,
  callback: () => any,
) => {
  gsap
    .timeline()
    .set(`body`, {
      backgroundColor: `#010103`,
    })
    // Hide preloader
    .to(preloader.current, {
      y: 0,
      opacity: 0,
      ease: `power3.inOut`,
      duration: 0.5,
      delay: 2.75,
    })
    // display none preloader
    .set(template.current, {
      display: `inherit`,
    })
    // DIsplay inherit template
    .set(template.current, {
      display: `inherit`,
    })

    // Show template
    .from(template.current, {
      y: 0,
      opacity: 0,
      ease: `power3.inOut`,
      duration: 0.5,
    })
    // Hide preloader
    .set(preloader.current, {
      display: `none`,
    })
    .eventCallback(`onComplete`, callback);
};

export const animatePanels = (panels: (HTMLDivElement | null)[]) => {
  gsap.fromTo(
    panels,
    {
      height: 0,
      skewX: 30,
      rotation: 0,
    },
    {
      duration: 1.5,
      height: `100%`,
      skewX: 0,
      rotation: 0,
      ease: `power4.inOut`,
      stagger: {
        amount: 1,
      },
    },
  );
};

export const animateTitles = (
  refGame: RefObject<HTMLSpanElement>,
  refOver: RefObject<HTMLSpanElement>,
  callback: () => void,
) => {
  gsap.to(refGame.current, {
    xPercent: -150,
    duration: 1,
    skewY: -5,
    ease: `power4.Out`,
    delay: 2.5,
  });

  gsap
    .to(refOver.current, {
      xPercent: 150,
      skewY: -5,
      duration: 1,
      ease: `power4.In`,
      delay: 2.5,
    })
    .eventCallback(`onComplete`, callback);
};
