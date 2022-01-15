import { breakpoints } from '@/styles/foundations';
import styled from '@emotion/styled';

export const HomeTitle = styled(`h1`)`
  font-size: ${({ theme }) => theme.typography.fontSizes[`9xl`]};
  ${breakpoints.tabletPortrait} {
    font-size: ${({ theme }) => theme.typography.fontSizes[`6xl`]};
  }
`;

export const DetailTitle = styled(`h1`)`
  font-size: ${({ theme }) => theme.typography.fontSizes[`5xl`]};
  margin-top: ${({ theme }) => theme.spacing[12]};
  margin-bottom: ${({ theme }) => theme.spacing[12]};

  ${breakpoints.tabletPortrait} {
    font-size: ${({ theme }) => theme.typography.fontSizes[`3xl`]};
  }
`;
