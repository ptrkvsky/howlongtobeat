import styled from '@emotion/styled';

export const ToggleModeButton = styled(`button`)`
  background: none;
  border: none;

  ${({ theme }) => theme.breakpoints.mobile} {
    position: fixed;
    bottom: ${({ theme }) => theme.spacing[2]};
    right: ${({ theme }) => theme.spacing[2]};
  }
`;
