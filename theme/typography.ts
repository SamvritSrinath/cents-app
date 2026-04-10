// Typography tokens matching web app

import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  heading1: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  heading3: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 15,
  },
};

export default typography;
