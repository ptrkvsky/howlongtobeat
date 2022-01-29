import { breakpoints } from '@/styles/foundations';
import styled from '@emotion/styled';

export const Wrapper = styled(`div`)`
  display: block;
  height: 80vh;
  .description {
    opacity: 0;
    position: relative;
    z-index: 20;
    max-width: 450px;
    font-family: ${({ theme }) => theme.typography.fonts.bodySlim};
    line-height: 1.28;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacings.wide};

    > div {
      overflow: hidden;
      line-height: 1;
    }

    .highlight {
      color: ${({ theme }) => theme.colors.primary[500]};
      font-family: ${({ theme }) => theme.typography.fonts.body};
    }

    p {
      margin: ${({ theme }) => theme.spacing[3]} 0;
      color: #fff;
      font-size: ${({ theme }) => theme.typography.fontSizes[`2xl`]};
    }
  }
`;

export const WrapperImage = styled(`div`)`
  position: absolute;
  z-index: 0;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  filter: blur(255px);
  transform: scale(0.85);
  transition: all 1s linear;
`;

export const Title = styled(`h1`)`
  opacity: 0;
  position: relative;
  z-index: 20;
  max-width: 450px;
  font-size: 36px;
  line-height: 40px;
  margin-top: 24.3vh;
  margin-bottom: ${({ theme }) => theme.spacing[8]};

  .highlight {
    -webkit-text-stroke-width: 1px;
    -webkit-text-stroke-color: ${({ theme }) => theme.colors.primary[500]};
    color: transparent;
  }

  ${breakpoints.tabletPortrait} {
    margin-top: ${({ theme }) => theme.spacing[2]};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;
