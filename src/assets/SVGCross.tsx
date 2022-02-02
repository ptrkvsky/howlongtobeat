import { useEffect, useRef } from 'react';

import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/dist/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);

const SVGJoystick = () => {
  const refSvg = useRef<SVGSVGElement>(null);
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

  useEffect(() => {
    gsap
      .timeline()
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
          duration: 0.25,
          stagger: 0.25,
        },
      );
  }, []);

  return (
    <>
      <svg
        width="98"
        height="99"
        viewBox="0 0 98 99"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line ref={refLine1} x1="32" y1="0.5" x2="65" y2="0.5" stroke="black" />
        <line
          ref={refLine2}
          x1="65.5"
          y1="2.18557e-08"
          x2="65.5"
          y2="33"
          stroke="black"
        />
        <line
          className="line2"
          x1="0.5"
          y1="33"
          x2="0.499999"
          y2="66"
          stroke="black"
        />
        <line
          ref={refLine3}
          x1="65"
          y1="33.5"
          x2="98"
          y2="33.5"
          stroke="black"
        />
        <line
          ref={refLine4}
          x1="97.5"
          y1="33"
          x2="97.5"
          y2="66"
          stroke="black"
        />
        <line y1="33.5" x2="33" y2="33.5" stroke="black" />

        <line x1="8" y1="48.5" x2="21" y2="48.5" stroke="black" />
        <line x1="77" y1="48.5" x2="90" y2="48.5" stroke="black" />
        <line y1="65.5" x2="33" y2="65.5" stroke="black" />
        <line
          ref={refLine7}
          x1="32"
          y1="98.5"
          x2="65"
          y2="98.5"
          stroke="black"
        />
        <line x1="65" y1="65.5" x2="98" y2="65.5" stroke="black" />

        <line x1="65.5" y1="66" x2="65.5" y2="99" stroke="black" />

        <line x1="32.5" y1="2.18557e-08" x2="32.5" y2="33" stroke="black" />
        <line x1="32.5" y1="66" x2="32.5" y2="99" stroke="black" />
        <line x1="49.5" y1="8" x2="49.5" y2="21" stroke="black" />
        <line x1="49.5" y1="78" x2="49.5" y2="91" stroke="black" />
      </svg>
      <svg
        width="98"
        height="99"
        viewBox="0 0 98 99"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="32" width="34" height="99" fill="black" />
        <rect y="33" width="98" height="33" fill="black" />
      </svg>
    </>
  );
};

export default SVGJoystick;
