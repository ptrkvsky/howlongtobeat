import { breakpoints } from './../../../styles/foundations/breakpoints';
import styled from '@emotion/styled';

export const TitleMain = styled(`h1`)`
  font-size: ${({ theme }) => theme.typography.fontSizes[`5xl`]};
  margin-top: 24.3vh;
  margin-bottom: ${({ theme }) => theme.spacing[8]};

  .name {
    color: ${({ theme }) => theme.colors.primary[500]};
    font-size: ${({ theme }) => theme.typography.fontSizes[`7xl`]};
  }

  ${breakpoints.tabletPortrait} {
    margin-top: ${({ theme }) => theme.spacing[2]};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;
