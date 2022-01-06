import styled from '@emotion/styled';

const Wrapper = styled(`li`)`
  transition: all linear 0.1s;
  &:hover {
    .theme-dark & {
      background-color: ${({ theme }) => theme.colors.gray[700]};
    }

    .theme-light & {
      background-color: ${({ theme }) => theme.colors.gray[300]};
    }
  }
  a {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    font-family: ${({ theme }) => theme.typography.fonts.heading};
    font-size: ${({ theme }) => theme.typography.fontSizes.lg};
    padding: ${({ theme }) => theme.spacing[1]};
  }
`;

const Placeholder = styled(`div`)`
  display: block;
  width: 70px;
  height: 45px;
  background-color: ${({ theme }) => theme.colors.gray[700]};

  .theme-dark & {
    background-color: ${({ theme }) => theme.colors.gray[700]};
  }

  .theme-light & {
    background-color: ${({ theme }) => theme.colors.gray[300]};
  }
`;

export { Wrapper, Placeholder };
