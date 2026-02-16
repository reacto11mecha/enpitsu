import { StyleSheet } from "react-native-unistyles";

const lightTheme = {
  colors: {
    primary: "#1A803C", // Enpitsu Green
    accent: "#F5F231", // Enpitsu Yellow
    typography: "#3C3B39", // Charcoal
    background: "#F8FAFC", // Slate 50
    surface: "#FFFFFF", // White
    muted: "#94a3b8", // Slate 400
    border: "#E2E8F0", // Slate 200
    error: "#EF4444", // Red 500
    inputBg: "#F1F5F9", // Slate 100
  },
  margins: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
} as const;

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: "#22c55e", // Lighter Green for Dark Mode
    accent: "#FACC15", // Darker Yellow
    typography: "#F1F5F9", // White text
    background: "#0f172a", // Dark Slate
    surface: "#1e293b", // Card background
    muted: "#64748b",
    border: "#334155",
    inputBg: "#020617",
  },
} as const;

const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};
type AppBreakpoints = typeof breakpoints;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
  settings: {
    adaptiveThemes: true,
  },
});
