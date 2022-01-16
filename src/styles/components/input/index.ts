import styled from '@emotion/styled';

const Input = styled(`input`)`
  width: 100%;
  min-width: 0px;
  outline: transparent solid 2px;
  outline-offset: 2px;
  position: relative;
  appearance: none;
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-family: ${({ theme }) => theme.typography.fonts.body};
  padding-inline-start: ${({ theme }) => theme.spacing[4]};
  padding-inline-end: ${({ theme }) => theme.spacing[4]};
  height: ${({ theme }) => theme.spacing[12]};
  border-radius: ${({ theme }) => theme.spacing[1]};
  border-width: 1px;
  border-style: solid;
  border-image: initial;
  border-color: inherit;
  background: ${({ theme }) => theme.colors.gray[700]};
  border-color: ${({ theme }) => theme.colors.gray[600]};
  color: ${({ theme }) => theme.colors.gray[100]};
`;

export { Input };
