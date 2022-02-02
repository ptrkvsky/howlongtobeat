import React from 'react';

import { Wrapper, WrapperSVG } from './style';
import SVGCross from '@/assets/SVGCross';

const PreloaderSvg = React.forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <>
      <Wrapper ref={ref} className="wrapper-preloader">
        <WrapperSVG className="wrapper-svg">
          <SVGCross />
        </WrapperSVG>
      </Wrapper>
    </>
  );
});

PreloaderSvg.displayName = `PreloaderSvg`;

export default PreloaderSvg;
