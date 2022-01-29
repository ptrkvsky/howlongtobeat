import styled from '@emotion/styled';

export const Wrapper = styled.div`
  opacity: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.5s linear;
  transition-delay: 5s;
  filter: blur(3px);

  &.is-visible {
    opacity: 1;
    filter: blur(0);
  }

  .wrapper-joystick {
    width: 48px;
  }
`;
