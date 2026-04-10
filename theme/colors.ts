// Design tokens for app themes

export interface AppColors {
  background: string;
  card: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  accent: {
    default: string;
    light: string;
    dark: string;
  };
  semantic: {
    error: string;
    warning: string;
    success: string;
    info: string;
  };
}

export const darkColors: AppColors = {
  background: '#09090b',
  card: '#18181b',
  border: '#27272a',
  text: {
    primary: '#fafafa',
    secondary: '#a1a1aa',
    muted: '#71717a',
  },
  accent: {
    default: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  semantic: {
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
  },
};

export const lightColors: AppColors = {
  background: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#64748b',
  },
  accent: {
    default: '#059669',
    light: '#10b981',
    dark: '#047857',
  },
  semantic: {
    error: '#dc2626',
    warning: '#d97706',
    success: '#16a34a',
    info: '#2563eb',
  },
};
export type ResolvedTheme = 'light' | 'dark';

export function getColorsForTheme(theme: ResolvedTheme): AppColors {
  return theme === 'light' ? lightColors : darkColors;
}

/**
 * Dark palette only. Prefer `useTheme().colors` from ThemeContext in UI so
 * light/dark/system preference applies; do not import this for screens/components.
 */
export const colors: AppColors = darkColors;

export default colors;
