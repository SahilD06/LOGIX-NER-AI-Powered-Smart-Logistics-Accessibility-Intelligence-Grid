import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  cardBg: string;
  subPanel: string;
  border: string;
  borderSoft: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  steelBlue: string;
  darkSlate: string;
  slateGray: string;
  taupe: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
  success: string;
  successBg: string;
  successBorder: string;
  inputBg: string;
}

export const URBAN_SLATE_LIGHT: ThemeColors = {
  bg: '#F1F5F9',
  cardBg: '#FFFFFF',
  subPanel: '#F8FAFC',
  border: '#E2E8F0',
  borderSoft: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  steelBlue: '#0284C7',
  darkSlate: '#334155',
  slateGray: '#64748B',
  taupe: '#78716C',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FECACA',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  success: '#059669',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  inputBg: '#F8FAFC',
};

export const URBAN_SLATE_DARK: ThemeColors = {
  bg: '#090D16',
  cardBg: '#111827',
  subPanel: '#1F2937',
  border: '#374151',
  borderSoft: '#1F2937',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  steelBlue: '#38BDF8',
  darkSlate: '#9CA3AF',
  slateGray: '#6B7280',
  taupe: '#A8A29E',
  danger: '#F87171',
  dangerBg: '#450A0A',
  dangerBorder: '#991B1B',
  warning: '#FBBF24',
  warningBg: '#451A03',
  warningBorder: '#92400E',
  success: '#34D399',
  successBg: '#064E3B',
  successBorder: '#065F46',
  inputBg: '#1F2937',
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: URBAN_SLATE_LIGHT,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';
  const colors = isDark ? URBAN_SLATE_DARK : URBAN_SLATE_LIGHT;

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
