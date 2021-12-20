import styled from '@emotion/styled';

export const ContainerContent = styled(`div`)`
  max-width: ${({ theme }) => theme.config.maxWidth.desktop};
  margin: 0 auto;

  ${({ theme }) => theme.breakpoints.tabletLandscape} {
    max-width: 100%;
    padding: 0 ${({ theme }) => theme.spacing[4]};
  }
  ${({ theme }) => theme.breakpoints.mobile} {
    max-width: 100%;
    padding: 0 ${({ theme }) => theme.spacing[2]};
  }
`;
