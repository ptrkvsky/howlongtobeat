import { Global, css, useTheme } from '@emotion/react';
import emotionReset from 'emotion-reset';
import { breakpoints } from './foundations';

const GlobalStyles = () => {
  const theme = useTheme();
  return (
    <Global
      styles={css`
        ${emotionReset}
        * {
          box-sizing: border-box;
          margin: 0;
        }
        :root {
          font-size: 1rem;
          font-size: clamp(
            0.875rem,
            0.4626rem + 1.0309vw + var(--user-font-scale),
            1.125rem
          );
        }
        &::selection {
          background: ${theme.colors.secondary[500]};
          transition: all 0.1s linear;
        }
        body {
          background: ${theme.colors.background};
          color: ${theme.colors.text};
          min-height: 100vh;
          font-family: ${theme.typography.fonts.body};
          transition-duration: 0.2s;
          transition-property: background-color, color;
          font-size: ${theme.typography.fontSizes.xl};
        }
        @font-face {
          font-family: 'Cirka';
          src: url('/fonts/PPCirka-Variable.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Bebas';
          src: url('/fonts/BebasNeueBold.woff2') format('woff2');
        }
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-family: ${theme.typography.fonts.heading};
          letter-spacing: ${theme.typography.letterSpacings.tight};
        }
        p {
          line-height: ${theme.typography.lineHeights[5]};
          font-size: ${theme.typography.fontSizes.lg};
        }

        a {
          text-decoration: none;
          color: inherit;
        }
        a:visited {
          color: inherit;
        }
        .bold,
        b,
        strong {
          font-weight: ${theme.typography.fontWeights.bold};
        }
        button {
          color: ${theme.colors.text};
        }

        .relative {
          position: relative;
        }

        .container {
          width: 100%;
          max-width: ${theme.config.maxWidth.desktop};
          margin-left: auto;
          margin-right: auto;
          ${breakpoints.tabletLandscape} {
            padding: 0 ${theme.spacing[2]};
          }
        }

        .primary-color {
          color: ${theme.colors.primary[500]};
        }

        .menu {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          padding: 0 0 25vh 0;
          --marquee-width: 100vw;
          --offset: 20vw;
          --move-initial: calc(-25% + var(--offset));
          --move-final: calc(-50% + var(--offset));
          --item-font-size: 10vw;
          counter-reset: menu;
          max-width: calc(100vw - 15px);
          overflow: hidden;

          ${breakpoints.tabletLandscape} {
            padding: 0;
          }
        }

        .menu__item {
          cursor: default;
          position: relative;
          padding: 0 5vw;
        }

        .menu__item-link {
          display: inline-block;
          cursor: pointer;
          position: relative;
          -webkit-text-stroke: 1.5px ${theme.colors.text};
          text-stroke: 1.5px ${theme.colors.text};
          -webkit-text-fill-color: transparent;
          text-fill-color: transparent;
          color: transparent;
          transition: opacity 0.4s;
          font-family: ${theme.typography.fonts.heading};

          a {
            -webkit-text-stroke: 1.5px ${theme.colors.text};
            text-stroke: 1.5px ${theme.colors.text};
            -webkit-text-fill-color: transparent;
            text-fill-color: transparent;
          }
        }

        .menu__item-link::before {
          all: initial;
          font-family: ${theme.typography.fonts.heading};
          counter-increment: menu;
          content: counter(menu);
          position: absolute;
          bottom: 55%;
          left: -${theme.spacing[`2.5`]};
          pointer-events: none;
          color: ${theme.colors.primary[500]};
        }

        .menu__item-link:hover {
          transition-duration: 0.1s;
          opacity: 0;
        }

        .menu__item-img {
          pointer-events: none;
          position: absolute;
          height: 50vh;
          max-height: 400px;
          opacity: 0;
          left: 100%;
          top: 50%;
          transform: translate3d(calc(-100% - 6vw), -30%, 0)
            translate3d(0, 20px, 0);
          z-index: 10;
        }

        .menu__item-link:hover + .menu__item-img {
          opacity: 1;
          transform: translate3d(calc(-100% - 6vw), -30%, 0)
            rotate3d(0, 0, 1, 4deg);
          transition: all 0.4s;
        }

        /* Make sure 3 items are visible in the viewport by setting suitable font size. */

        .marquee {
          position: absolute;
          top: 0;
          left: 0;
          width: var(--marquee-width);
          overflow: hidden;
          pointer-events: none;
        }

        .marquee__inner {
          width: fit-content;
          display: flex;
          position: relative;
          transform: translate3d(var(--move-initial), 0, 0);
          animation: marquee 5s linear infinite;
          animation-play-state: paused;
          opacity: 0;
          transition: opacity 0.1s;
          font-family: ${theme.typography.fonts.heading};
        }

        .menu__item-link:hover ~ .marquee .marquee__inner {
          animation-play-state: running;
          opacity: 1;
          transition-duration: 0.4s;
        }

        .marquee span {
          text-align: center;
        }

        .menu__item-link,
        .marquee span {
          white-space: nowrap;
          font-size: var(--item-font-size);
          padding: 0 1vw;
          font-weight: 900;
          line-height: 1.15;
        }

        .marquee span {
          font-style: italic;
        }

        @keyframes marquee {
          0% {
            transform: translate3d(var(--move-initial), 0, 0);
          }

          100% {
            transform: translate3d(var(--move-final), 0, 0);
          }
        }
      `}
    />
  );
};

export default GlobalStyles;
