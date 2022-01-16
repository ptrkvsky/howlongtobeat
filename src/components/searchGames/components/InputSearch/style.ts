import styled from '@emotion/styled';

const InputSearch = styled(`input`)`
  min-height: 45px;
  padding: 0 ${({ theme }) => theme.spacing[3]};
  border-radius: 3px;
  font-family: ${({ theme }) => theme.typography.fonts.heading};
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  border: none;
  transition: all 0.2s;

  .theme-dark & {
    background-color: ${({ theme }) => theme.colors.gray[600]};
    color: ${({ theme }) => theme.colors.gray[100]};
    box-shadow: var(--shadow-elevation-medium);
  }

  .theme-light & {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[600]};
    box-shadow: var(--shadow-elevation-low);
  }

  &:focus {
    outline: none !important;
    border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  }

  ::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    .theme-dark & {
      color: ${({ theme }) => theme.colors.gray[400]};
    }

    .theme-light & {
      color: ${({ theme }) => theme.colors.gray[500]};
    }

    opacity: 1; /* Firefox */
    font-family: ${({ theme }) => theme.typography.fonts.heading};
  }
`;

export { InputSearch };
