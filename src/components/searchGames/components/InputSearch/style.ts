import styled from '@emotion/styled';

const Input = styled(`input`)`
  min-height: 45px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.gray[600]};
  color: ${({ theme }) => theme.colors.gray[100]};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  border: none;
  padding: 0 ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fonts.heading};
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};

  ::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: ${({ theme }) => theme.colors.gray[400]};
    opacity: 1; /* Firefox */
    font-family: ${({ theme }) => theme.typography.fonts.heading};
  }
`;

export { Input };
