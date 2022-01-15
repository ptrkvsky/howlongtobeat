import styled from '@emotion/styled';

const Label = styled(`div`)`
  font-size: ${({ theme }) => theme.typography.fontSizes[`2xl`]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export { Label };
