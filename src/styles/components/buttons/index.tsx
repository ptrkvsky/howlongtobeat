import styled from '@emotion/styled';

const ButtonSubmit = styled(`button`)`
  display: inline-flex;
  margin-top: ${({ theme }) => theme.spacing[8]};
  appearance: none;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  user-select: none;
  position: relative;
  white-space: nowrap;
  vertical-align: middle;
  outline: transparent solid 2px;
  outline-offset: 2px;
  width: auto;
  line-height: 1.2;
  border-radius: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  text-transform: uppercase;
  background: ${({ theme }) => theme.colors.gray[700]};
  color: ${({ theme }) => theme.colors.gray[200]};
  cursor: pointer;
  border: none;
`;

export { ButtonSubmit };
