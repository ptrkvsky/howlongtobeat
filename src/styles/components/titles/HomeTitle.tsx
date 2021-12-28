import { breakpoints } from '@/styles/foundations';
import styled from '@emotion/styled';

export const HomeTitle = styled(`h1`)`
  font-size: ${({ theme }) => theme.typography.fontSizes[`9xl`]};
  ${breakpoints.tabletPortrait} {
    font-size: ${({ theme }) => theme.typography.fontSizes[`6xl`]};
  }
`;
