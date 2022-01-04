import styled from '@emotion/styled';

const Input = styled(`input`)`
  min-height: 45px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.gray[600]};
  color: ${({ theme }) => theme.colors.gray[100]};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  border: none;
`;

export { Input };
