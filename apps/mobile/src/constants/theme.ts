/**
 * Atena Design System tokens (from docs/design-system/tokens.json)
 */

export const colors = {
  primary: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065",
  },
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },
  semantic: {
    success: { light: "#dcfce7", default: "#22c55e", dark: "#15803d" },
    warning: { light: "#fef9c3", default: "#eab308", dark: "#a16207" },
    error: { light: "#fee2e2", default: "#ef4444", dark: "#b91c1c" },
    info: { light: "#dbeafe", default: "#3b82f6", dark: "#1d4ed8" },
  },
} as const;

export const lightTheme = {
  background: "#ffffff",
  surface: "#fafafa",
  surfaceRaised: "#ffffff",
  border: "#e5e5e5",
  borderStrong: "#d4d4d4",
  textPrimary: "#171717",
  textSecondary: "#525252",
  textTertiary: "#737373",
  textInverse: "#ffffff",
  primaryBg: "#f5f3ff",
  primaryText: "#7c3aed",
} as const;

export const darkTheme = {
  background: "#0a0a0a",
  surface: "#171717",
  surfaceRaised: "#262626",
  border: "#262626",
  borderStrong: "#404040",
  textPrimary: "#fafafa",
  textSecondary: "#a3a3a3",
  textTertiary: "#737373",
  textInverse: "#171717",
  primaryBg: "#2e1065",
  primaryText: "#c4b5fd",
} as const;

export type Theme = {
  [K in keyof typeof lightTheme]: string;
};

/**
 * Tamagui v5 기반 토큰
 * - spacing: Tamagui space 토큰 (size * 0.7 - 12)
 * - radius: Tamagui radius 토큰
 * - fontSize: Tamagui native font size 토큰 (iOS HIG 기반)
 * - component: 컴포넌트별 기본 스펙
 */

export const spacing = {
  0: 0,
  0.5: 1,
  1: 2,
  1.5: 4,
  2: 7,
  2.5: 10,
  3: 13,
  3.5: 16,
  4: 18,
  4.5: 21,
  5: 24,
  6: 32,
  7: 39,
  8: 46,
  9: 53,
  10: 60,
} as const;

export const size = {
  1: 20,
  1.5: 24,
  2: 28,
  2.5: 32,
  3: 36,
  3.5: 40,
  4: 44,
  4.5: 48,
  5: 52,
  6: 64,
  7: 74,
  8: 84,
  10: 104,
} as const;

export const radius = {
  0: 0,
  1: 3,
  2: 5,
  3: 7,
  4: 9,
  5: 10,
  6: 16,
  7: 19,
  8: 22,
  10: 34,
  12: 50,
  full: 9999,
} as const;

export const fontSize = {
  1: 11,
  2: 12,
  3: 15,
  4: 17,
  5: 20,
  6: 22,
  7: 24,
  8: 28,
  9: 32,
  10: 40,
} as const;

export const lineHeight = {
  1: 16,
  2: 17,
  3: 20,
  4: 22,
  5: 25,
  6: 27,
  7: 29,
  8: 33,
  9: 37,
  10: 45,
} as const;

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const socialColors = {
  kakao: {
    background: "#FEE500",
    text: "#191919",
  },
  google: {
    background: "#ffffff",
    text: "#171717",
    border: "#e5e5e5",
  },
  apple: {
    background: "#000000",
    text: "#ffffff",
  },
} as const;
