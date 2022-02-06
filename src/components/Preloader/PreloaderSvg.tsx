import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Wrapper, WrapperSVG } from './style';
import SVGCross from '@/assets/SVGCross';

const PreloaderSvg = React.forwardRef<HTMLDivElement>((_props, ref) => {
  const refWrapperSvg = useRef<HTMLDivElement>(null);

  const handleComplete = () => {
    if (refWrapperSvg) {
    }
  };

  useEffect(() => {
    // Final animation
    // Cross became bigger
    gsap
      .timeline()
      .to(refWrapperSvg.current, {
        duration: 1,
        delay: 1.5,
        ease: `power4.in`,
        scale: 33.5,
        rotate: 90,
        transformOrigin: `center`,
      })
      .set(`body`, {
        backgroundColor: `hsl(240deg 50% 1%)`,
      });
  }, []);

  return (
    <>
      <Wrapper ref={ref} className="wrapper-preloader">
        <WrapperSVG ref={refWrapperSvg} className="wrapper-svg">
          <SVGCross />
        </WrapperSVG>
      </Wrapper>
    </>
  );
});

PreloaderSvg.displayName = `PreloaderSvg`;

export default PreloaderSvg;
