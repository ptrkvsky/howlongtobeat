import styled from '@emotion/styled';

const Button = styled(`button`)`
  position: relative;

  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  width: auto;
  margin-top: ${({ theme }) => theme.spacing[8]};

  display: inline-flex;
  align-items: center;
  justify-content: center;

  white-space: nowrap;
  vertical-align: middle;
  outline: transparent solid 2px;
  outline-offset: 2px;

  line-height: 1.2;
  border-radius: ${({ theme }) => theme.spacing[2]};

  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  text-transform: uppercase;

  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(0, 212, 255, 1) 100%
  );

  color: ${({ theme }) => theme.colors.gray[200]};
  cursor: pointer;
  border: none;
  user-select: none;
  appearance: none;
`;

export { Button };
