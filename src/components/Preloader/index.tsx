import React from 'react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { animatePanels, enterTitles, exitTitles } from './animation';
import { Wrapper, Title } from './style';

const Preloader = React.forwardRef<HTMLDivElement>((_props, ref) => {
  // Ref panels
  const panelRefOne = useRef<HTMLDivElement>(null);
  const panelRefTwo = useRef<HTMLDivElement>(null);
  const panelRefThree = useRef<HTMLDivElement>(null);
  const panelRefFour = useRef<HTMLDivElement>(null);

  // Ref titles
  const refTitle = useRef<HTMLDivElement>(null);
  const refGame = useRef<HTMLSpanElement>(null);
  const refOver = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const panels = [
      panelRefOne.current,
      panelRefTwo.current,
      panelRefThree.current,
      panelRefFour.current,
    ];

    const callBack = () => null;
    gsap.set(refTitle.current, {
      opacity: 1,
    });
    enterTitles(refGame, refOver);
    animatePanels(panels, 0.5);
    exitTitles(refGame, refOver, callBack);
  }, []);

  return (
    <>
      <Wrapper ref={ref} className="wrapper-preloader">
        <Title ref={refTitle} className="title">
          <span ref={refGame} className="item game">
            GAME
          </span>
          <span ref={refOver} className="item over">
            OVER
          </span>
        </Title>

        <div ref={panelRefOne} className="panel one"></div>
        <div ref={panelRefTwo} className="panel two"></div>
        <div ref={panelRefThree} className="panel three"></div>
        <div ref={panelRefFour} className="panel four"></div>
      </Wrapper>
    </>
  );
});

Preloader.displayName = `Preloader`;

export default Preloader;
