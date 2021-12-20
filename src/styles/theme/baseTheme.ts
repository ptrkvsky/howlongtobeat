import { breakpoints, config, spacing, typography } from '../foundations';
import { baseColors } from '../foundations/colors';

export type TypeBaseTheme = typeof baseTheme;

export const baseTheme = {
  colors: {
    ...baseColors,
  },
  breakpoints,
  config,
  spacing,
  typography,
};
