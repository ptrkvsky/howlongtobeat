import styled from '@emotion/styled';

const Nav = styled(`nav`)`
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding: 10vh 0 25vh;
  --marquee-width: 100vw;
  --offset: 20vw;
  --move-initial: calc(-25% + var(--offset));
  --move-final: calc(-50% + var(--offset));
  --item-font-size: 10vw;
  counter-reset: menu;
`;

export { Nav };
