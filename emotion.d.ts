import {
  Breakpoints,
  Typography,
  Spacing,
  Config,
} from './src/styles/foundations';
import { Colors } from './src/styles/foundations/colors/types/colors';
import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    breakpoints: Breakpoints;
    colors: Colors;
    config: Config;
    spacing: Spacing;
    typography: Typography;
  }
}
