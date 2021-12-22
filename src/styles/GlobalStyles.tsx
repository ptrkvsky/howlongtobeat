import { Global, css, useTheme } from '@emotion/react';

const GlobalStyles = () => {
  const theme = useTheme();
  return (
    <Global
      styles={css`
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
          color: var(--color-primary);
        }
        .bold,
        b,
        strong {
          font-family: var(--font-primary-bold);
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
        }

        .primary-color {
          color: ${theme.colors.primary[500]};
        }

        @keyframes backgroundEffect {
          0% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 40% 10%;
          }
          50% {
            background-position: 0 10%;
          }
          75% {
            background-position: 10% 40%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}
    />
  );
};

export default GlobalStyles;
