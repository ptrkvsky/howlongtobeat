import styled from '@emotion/styled';

export const Hidden = styled(`div`)`
  position: relative;

  &:before {
    content: '';
    position: absolute;
    z-index: 10;
    display: block;
    top: -10px;
    height: 10px;
    width: 100%;
    background: ${({ theme }) => theme.colors.background};
  }

  &:after {
    content: '';
    position: absolute;
    z-index: 10;
    display: block;
    top: 33vh;
    height: 10px;
    width: 100%;
    background: ${({ theme }) => theme.colors.background};
    ${breakpoints.tabletPortrait} {
      top: 70vh;
    }
  }
`;

export const Wrapper = styled(`div`)`
  position: absolute;
  height: 33vh;
  width: 100%;
  filter: blur(5px);

  &:before {
    content: '';
    position: absolute;
    z-index: 10;
    display: block;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.colors.background};
    opacity: 0.5;
  }
`;
