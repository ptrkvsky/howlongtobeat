import styled from '@emotion/styled';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useTheme } from '@emotion/react';

const Wrapper = styled(`div`)`
  position: absolute;
  right: 0;
  top: calc(33vh - 125px);
  width: 200px;
  height: 200px;
  padding: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 50%;
  box-shadow: var(--box-shadow);

  text {
    font-family: ${({ theme }) => theme.typography.fonts.heading};
    font-size: ${({ theme }) => theme.typography.fontSizes[`9xl`]};
  }

  .theme-dark & {
    box-shadow: var(--shadow-elevation-medium);
  }

  .theme-light & {
    box-shadow: var(--shadow-elevation-low);
  }
  ${({ theme }) => theme.breakpoints.mobile} {
    width: 100px;
    height: 100px;
    padding: ${({ theme }) => theme.spacing[2]};
    right: initial;
    left: ${({ theme }) => theme.spacing[4]};
    top: ${({ theme }) => theme.spacing[4]};
  }
`;

interface Props {
  percentage: number;
}

const CircularBar = ({ percentage }: Props) => {
  const theme = useTheme();

  return (
    <Wrapper>
      <CircularProgressbar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({
          // Rotation of path and trail, in number of turns (0-1)
          rotation: 0.25,

          // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
          strokeLinecap: `butt`,

          // Text size
          textSize: `${theme.typography.fontSizes[`2xl`]}`,

          // How long animation takes to go from one percentage to another, in seconds
          pathTransitionDuration: 0.5,

          // Can specify path transition in more detail, or remove it entirely
          // pathTransition: 'none',

          // Colors
          pathColor: `#33ff00`,
          textColor: `#33ff00`,
          trailColor: `#d6d6d6`,
          backgroundColor: `${theme.colors.background}`,
        })}
      />
    </Wrapper>
  );
};

export default CircularBar;
