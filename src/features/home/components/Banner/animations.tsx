import gsap from 'gsap';

export const removeFilter = (
  wrapperImage: React.RefObject<HTMLSpanElement>,
  delay = 0,
) => {
  gsap.to(wrapperImage.current, {
    css: { scale: 1, filter: `blur(0)` },
    delay,
    duration: 1,
  });
};

export const enterText = (
  refTitle: React.RefObject<HTMLSpanElement>,
  splitTextTitle: SplitText,
  delay = 0,
) => {
  gsap
    .timeline()
    .set([refTitle.current], {
      opacity: 1,
    })
    .from(splitTextTitle.chars, {
      duration: 0.5,
      ease: `power4.linear`,
      y: `-100%`,
      skewY: 0,
      scale: 0.95,
      opacity: 0,
      stagger: {
        amount: 0.3,
      },
      delay,
    });
};

export const revealDescription = (
  refDescription: React.RefObject<HTMLSpanElement>,
  splitDescription: SplitText,
  delay = 0,
) => {
  gsap.set(refDescription.current, { opacity: 1 });
  gsap.from(splitDescription.words, {
    duration: 1,
    opacity: 0,
    y: -80,
    skewY: 10,
    ease: `power4.in`,
    stagger: 0.01,
    delay,
  });
};
