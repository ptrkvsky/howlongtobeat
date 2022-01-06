import styled from '@emotion/styled';

const Wrapper = styled(`div`)`
  position: absolute;
  max-height: 33vh;
  overflow-y: scroll;

  padding: ${({ theme }) => theme.spacing[3]} 0;

  z-index: 900;

  .theme-dqrk & {
    background-color: ${({ theme }) => theme.colors.gray[600]};
    color: ${({ theme }) => theme.colors.gray[100]};
    box-shadow: var(--shadow-elevation-low);
  }

  .theme-light & {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[600]};
    box-shadow: var(--shadow-elevation-low);
  }

  &.close {
    display: none;
  }

  /* width */
  ::-webkit-scrollbar {
    width: 8px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.gray[200]};
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[500]};
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
    background: ${({ theme }) => theme.colors.gray[600]};
  }
`;

export { Wrapper };
