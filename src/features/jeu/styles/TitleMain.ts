import styled from '@emotion/styled';

export const TitleMain = styled(`h1`)`
  font-size: ${({ theme }) => theme.typography.fontSizes[`5xl`]};
  margin-top: ${({ theme }) => theme.spacing[24]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  .name {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;
