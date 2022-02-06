import { useEffect, useRef } from 'react';

import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/dist/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);

const SVGJoystick = () => {
  const refLine1 = useRef<SVGLineElement>(null);
  const refLine2 = useRef<SVGLineElement>(null);
  const refLine3 = useRef<SVGLineElement>(null);
  const refLine4 = useRef<SVGLineElement>(null);
  const refLine5 = useRef<SVGLineElement>(null);
  const refLine6 = useRef<SVGLineElement>(null);
  const refLine7 = useRef<SVGLineElement>(null);
  const refLine8 = useRef<SVGLineElement>(null);
  const refLine9 = useRef<SVGLineElement>(null);
  const refLine10 = useRef<SVGLineElement>(null);
  const refLine11 = useRef<SVGLineElement>(null);
  const refLine12 = useRef<SVGLineElement>(null);
  const refTrait1 = useRef<SVGLineElement>(null);
  const refTrait2 = useRef<SVGLineElement>(null);
  const refTrait3 = useRef<SVGLineElement>(null);
  const refTrait4 = useRef<SVGLineElement>(null);
  // Blackcross
  const refBlackCross = useRef<SVGSVGElement>(null);
  const refWhiteCross = useRef<SVGSVGElement>(null);

  const durationStagger = 0.08;
  const globalDelay = 0.2;

  useEffect(() => {
    gsap
      .timeline()
      .delay(globalDelay)
      // reset
      .set(
        [
          refTrait1.current,
          refTrait2.current,
          refTrait3.current,
          refTrait4.current,
        ],
        {
          drawSVG: `0%`,
        },
      )
      .set(refWhiteCross.current, {
        opacity: 1,
      })
      .from(
        [
          refLine1.current,
          refLine2.current,
          refLine3.current,
          refLine4.current,
        ],
        {
          drawSVG: `0%`,
          ease: `linear`,
          duration: durationStagger,
          stagger: durationStagger,
        },
      )
      // sens inverse
      .fromTo(
        [refLine5.current],
        {
          drawSVG: `100% 100%`,
          ease: `linear`,
          duration: durationStagger,
          stagger: durationStagger,
        },
        {
          drawSVG: true,
          ease: `linear`,
          duration: durationStagger,
          stagger: durationStagger,
        },
      )
      .from([refLine6.current], {
        drawSVG: `0%`,
        ease: `linear`,
        duration: durationStagger,
        stagger: durationStagger,
      })
      // sens inverse
      .fromTo(
        [
          refLine7.current,
          refLine8.current,
          refLine9.current,
          refLine10.current,
        ],
        {
          drawSVG: `100% 100%`,
          ease: `linear`,
        },
        {
          drawSVG: true,
          ease: `linear`,
          duration: durationStagger,
          stagger: durationStagger,
        },
      )
      .from(refLine11.current, {
        drawSVG: `0%`,
        ease: `linear`,
        duration: durationStagger,
        stagger: durationStagger,
      })
      // sens inverse
      .fromTo(
        refLine12.current,
        {
          drawSVG: `100% 100%`,
          ease: `linear`,
        },
        {
          drawSVG: true,
          ease: `linear`,
          duration: durationStagger,
        },
      )
      // trait
      // horizontal
      .from(refTrait1.current, {
        drawSVG: `0%`,
        ease: `linear`,
        duration: 0.25,
      })
      .fromTo(
        refTrait2.current,
        {
          drawSVG: `100% 100%`,
          ease: `linear`,
        },
        {
          drawSVG: true,
          ease: `linear`,
          duration: 0.25,
          delay: -0.25,
        },
      )
      // horizontal
      .from(refTrait4.current, {
        drawSVG: `0%`,
        ease: `linear`,
        duration: 0.25,
        delay: -0.25,
      })
      .fromTo(
        refTrait3.current,
        {
          drawSVG: `100% 100%`,
          ease: `linear`,
        },
        {
          drawSVG: true,
          ease: `linear`,
          duration: 0.25,
          delay: -0.25,
        },
      )
      // Reveal Black
      .to(refBlackCross.current, {
        opacity: 1,
        ease: `linear`,
        duration: 0.35,
      })
      .set(refWhiteCross.current, {
        opacity: 0,
      });
  }, []);

  return (
    <>
      <svg
        width="98"
        height="99"
        viewBox="0 0 98 99"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={refWhiteCross}
        className="white-cross"
      >
        <line
          ref={refLine1}
          x1="32"
          y1="0.5"
          x2="65"
          y2="0.5"
          stroke="#060d2a"
        />
        <line
          ref={refLine2}
          x1="65.5"
          y1="2.18557e-08"
          x2="65.5"
          y2="33"
          stroke="#060d2a"
        />

        <line
          ref={refLine3}
          x1="65"
          y1="33.5"
          x2="98"
          y2="33.5"
          stroke="#060d2a"
        />
        <line
          ref={refLine4}
          x1="97.5"
          y1="33"
          x2="97.5"
          y2="66"
          stroke="#060d2a"
        />
        <line
          ref={refLine5}
          x1="65"
          y1="65.5"
          x2="98"
          y2="65.5"
          stroke="#060d2a"
        />
        <line
          ref={refLine6}
          x1="65.5"
          y1="66"
          x2="65.5"
          y2="99"
          stroke="#060d2a"
        />

        <line
          ref={refLine7}
          x1="32"
          y1="98.5"
          x2="65"
          y2="98.5"
          stroke="#060d2a"
        />
        <line
          ref={refLine8}
          x1="32.5"
          y1="66"
          x2="32.5"
          y2="99"
          stroke="#060d2a"
        />
        <line ref={refLine9} y1="65.5" x2="33" y2="65.5" stroke="#060d2a" />
        <line
          ref={refLine10}
          x1="0.5"
          y1="33"
          x2="0.499999"
          y2="66"
          stroke="#060d2a"
        />
        <line ref={refLine11} y1="33.5" x2="33" y2="33.5" stroke="#060d2a" />

        <line
          className="12"
          ref={refLine12}
          x1="32.5"
          y1="2.18557e-08"
          x2="32.5"
          y2="33"
          stroke="#060d2a"
        />
        <line
          ref={refTrait1}
          x1="77"
          y1="48.5"
          x2="90"
          y2="48.5"
          stroke="#060d2a"
        />
        <line
          ref={refTrait2}
          x1="8"
          y1="48.5"
          x2="21"
          y2="48.5"
          stroke="#060d2a"
        />
        <line
          ref={refTrait3}
          x1="49.5"
          y1="8"
          x2="49.5"
          y2="21"
          stroke="#060d2a"
        />
        <line
          ref={refTrait4}
          x1="49.5"
          y1="78"
          x2="49.5"
          y2="91"
          stroke="#060d2a"
        />
      </svg>
      <svg
        width="98"
        height="99"
        viewBox="0 0 98 99"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="black-cross"
        ref={refBlackCross}
      >
        <rect x="32" width="34" height="99" fill="black" />
        <rect y="33" width="98" height="33" fill="black" />
      </svg>
    </>
  );
};

export default SVGJoystick;
