import { breakpoints } from './../../../styles/foundations/breakpoints';
import styled from '@emotion/styled';

export const TitleMain = styled(`h1`)`
  font-size: ${({ theme }) => theme.typography.fontSizes[`5xl`]};
  margin-top: 6.9rem;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  .name {
    color: ${({ theme }) => theme.colors.primary[500]};
  }

  ${breakpoints.tabletPortrait} {
    margin-top: ${({ theme }) => theme.spacing[2]};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;
