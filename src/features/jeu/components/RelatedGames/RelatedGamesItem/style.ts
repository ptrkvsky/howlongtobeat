import styled from '@emotion/styled';

const Wrapper = styled(`div`)`
  cursor: default;
  position: relative;
  padding: 0 5vw;
`;

const SpanLink = styled(`div`)`
  white-space: nowrap;
  font-size: 10vw;
  font-family: ${({ theme }) => theme.typography.fonts.heading};
  padding: 0 1vw;
  font-weight: 900;
  line-height: 1.15;

  display: inline-block;
  cursor: pointer;
  position: relative;
  -webkit-text-stroke: 1.5px #000;
  text-stroke: 1.5px #000;
  -webkit-text-fill-color: transparent;
  text-fill-color: transparent;
  color: transparent;
  transition: opacity 0.4s;
`;

const Marquee = styled(`div`)`
  position: absolute;
  top: 0;
  left: 0;
  width: var(--marquee-width);
  overflow: hidden;
  pointer-events: none;
  mix-blend-mode: color-burn;

  .marquee__inner {
    width: fit-content;
    display: flex;
    position: relative;
    transform: translate3d(var(--move-initial), 0, 0);
    animation: marquee 5s linear infinite;
    animation-play-state: paused;
    opacity: 0;
    transition: opacity 0.1s;
  }

  .menu__item-link,
  span {
    white-space: nowrap;
    font-size: var(--item-font-size);
    padding: 0 1vw;
    font-weight: 900;
    line-height: 1.15;
  }

  .menu__item-link:hover ~ .marquee__inner {
    animation-play-state: running;
    opacity: 1;
    transition-duration: 0.4s;
  }

  span {
    font-size: 10vw;
    padding: 0 2vw;
  }

  &:hover .marquee__inner {
    animation-play-state: running;
    opacity: 1;
    transition-duration: 0.4s;
  }

  @keyframes marquee {
    0% {
      transform: translate3d(calc(-25% + 20vw), 0, 0);
    }

    100% {
      transform: translate3d(calc(-50% + 20vw), 0, 0);
    }
  }
`;
export { Wrapper, SpanLink, Marquee };
