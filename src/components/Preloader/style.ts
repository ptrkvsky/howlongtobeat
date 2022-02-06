import styled from '@emotion/styled';
import { typography } from '@/styles/foundations';

export const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100%;

  .panel {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100vw;
    height: 0vh;
    mix-blend-mode: exclusion;
    &.one {
      background-color: #0400ff;
    }
    &.two {
      background-color: red;
    }
    &.three {
      background-color: #fff700;
    }
    &.four {
      background-color: #00ffd0;
    }
  }
`;

export const WrapperSVG = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: clamp(100px, 10vw, 200px);

  svg {
    width: 100%;
    height: 100%;
  }
  .white-cross {
    opacity: 0;
  }
  .black-cross {
    position: absolute;
    opacity: 0;
  }
`;

export const Title = styled.div`
  position: fixed;
  left: 0;
  z-index: 120;
  color: #09112c;
  font-size: 24.8vw;
  font-family: ${typography.fonts.heading};
  letter-spacing: ${typography.letterSpacings.tighter};
  line-height: 0.8;
  mix-blend-mode: exclusion;
  max-width: 100vw;
  opacity: 0;

  .item {
    position: relative;
    display: block;
  }
`;
