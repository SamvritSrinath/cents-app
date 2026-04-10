import { colors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography } from './typography';

// Theme exports
export { colors, default as colorsDefault } from './colors';
export { typography, default as typographyDefault } from './typography';
export { spacing, borderRadius, default as spacingDefault } from './spacing';

// Combined theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
};

export default theme;
