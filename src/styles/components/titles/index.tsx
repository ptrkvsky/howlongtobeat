import { breakpoints } from '@/styles/foundations';
import styled from '@emotion/styled';

export const HomeTitle = styled(`h1`)`
  font-size: ${({ theme }) => theme.typography.fontSizes[`9xl`]};
  color: ${({ theme }) => theme.colors.whiteAlpha[800]};

  ${breakpoints.tabletPortrait} {
    font-size: ${({ theme }) => theme.typography.fontSizes[`6xl`]};
  }
`;

export const List = styled(`ul`)`
  margin-top: ${({ theme }) => theme.spacing[12]};
  a {
    display: inline-block;
    color: ${({ theme }) => theme.colors.whiteAlpha[800]};

    padding-bottom: ${({ theme }) => theme.spacing[4]};
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
