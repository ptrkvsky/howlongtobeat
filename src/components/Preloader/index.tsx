import { useAppDispatch } from '@/redux/hooks';
import { setIsLoaded } from '@/features/app/slices/appSlice';
import { useEffect, useRef } from 'react';
import { animatePanels, animateTitles } from './animation';
import { Wrapper, Title } from './style';
import React from 'react';

const Preloader = React.forwardRef<HTMLDivElement>((_props, ref) => {
  // const dispatch = useAppDispatch();

  // Ref panels
  const panelRefOne = useRef<HTMLDivElement>(null);
  const panelRefTwo = useRef<HTMLDivElement>(null);
  const panelRefThree = useRef<HTMLDivElement>(null);
  const panelRefFour = useRef<HTMLDivElement>(null);

  // Ref titles
  const refGame = useRef<HTMLSpanElement>(null);
  const refOver = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const panels = [
      panelRefOne.current,
      panelRefTwo.current,
      panelRefThree.current,
      panelRefFour.current,
    ];

    // const callBack = () => dispatch(setIsLoaded());
    const callBack = () => null;

    animatePanels(panels);
    animateTitles(refGame, refOver, callBack);
  }, []);

  return (
    <>
      <Wrapper ref={ref} className="wrapper-preloader">
        <Title className="title">
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
