import styled from '@emotion/styled';

const Wrapper = styled(`div`)`
  position: absolute;
  max-height: 33vh;
  overflow-y: scroll;
  background-color: ${({ theme }) => theme.colors.gray[600]};
  color: ${({ theme }) => theme.colors.gray[100]};
  padding: ${({ theme }) => theme.spacing[3]};
`;

export { Wrapper };
