import styled from '@emotion/styled';

interface PropsButton {
  isDark: boolean;
  styleColor: string;
}

export const ToggleModeButton = styled.button<PropsButton>`
  opacity: 0.5;
  position: relative;
  border-radius: 5px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  border: none;
  background: none;
  &:hover {
    opacity: 1;
  }
  .moon-or-sun {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: ${(props) => (props.isDark ? `4px` : `2px`)} solid;
    border-color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.text};
    transform: scale(${(props) => (props.isDark ? 0.5 : 1)});
    transition: all 0.45s ease;
    overflow: ${(props) => (props.isDark ? `visible` : `hidden`)};
  }
  .moon-or-sun::before {
    content: '';
    position: absolute;
    right: -9px;
    top: -9px;
    height: 20px;
    width: 20px;
    border: 2px solid;
    border-color: ${({ theme }) => theme.colors.text};
    border-radius: 50%;
    transform: translate(${(props) => (props.isDark ? `14px, -14px` : `0, 0`)});
    opacity: ${(props) => (props.isDark ? 0 : 1)};
    transition: transform 0.45s ease;
  }
  .moon-or-sun::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin: -4px 0 0 -4px;
    position: absolute;
    top: 50%;
    left: 50%;

    .theme-dark & {
      box-shadow: 0 -23px 0 #fff, 0 23px 0 #fff, 23px 0 0 #fff, -23px 0 0 #fff,
        15px 15px 0 #fff, -15px 15px 0 #fff, 15px -15px 0 #fff,
        -15px -15px 0 #fff;
      transform: scale(1);
    }
    .theme-light & {
      box-shadow: 0 -23px 0 #000, 0 23px 0 #000, 23px 0 0 #000, -23px 0 0 #000,
        15px 15px 0 #000, -15px 15px 0 #000, 15px -15px 0 #000,
        -15px -15px 0 #000;
      transform: scale(0);
    }
    transition: all 0.35s ease;
  }
  .moon-mask {
    position: absolute;
    right: 4px;
    top: 4px;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 0;
    transition: transform 0.45s ease;
    .theme-dark & {
      transform: translate('4px, -4px');
      opacity: 0;
      background: #000;
    }

    .theme-light & {
      transform: translate('0, 0');
      opacity: 1;
      background: #fff;
    }
  }
`;
