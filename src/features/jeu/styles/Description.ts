import styled from '@emotion/styled';

export const Description = styled(`div`)`
  margin-top: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.typography.fontSizes[`2xl`]};
  line-height: ${({ theme }) => theme.typography.lineHeights[`7`]};
`;
