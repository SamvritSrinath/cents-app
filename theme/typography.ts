// Typography tokens matching web app

import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  heading1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  heading2: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

export default typography;
