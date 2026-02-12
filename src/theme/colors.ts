/**
 * Enhanced Color System for PKKC Mobile App
 * Extends the existing Colors.ts with a comprehensive color palette
 */

export const primaryColor = "#08113a";
export const secondaryColor = "#ffffff";
export const tertiaryColor = "#e8a812";

// Base color palette
export const ColorPalette = {
  // Primary brand colors
  primary: {
    50: '#e8f1f8',
    100: '#d1e3f1',
    200: '#a3c7e3',
    300: '#75aad5',
    400: '#478ec7',
    500: '#0a7ea4', // Main primary color
    600: '#086a8a',
    700: '#065670',
    800: '#044256',
    900: '#022e3c',
  },

  // Secondary colors
  secondary: {
    50: '#fefefe',
    100: '#fcfcfc',
    200: '#f8f8f8',
    300: '#f2f2f2',
    400: '#e8e8e8',
    500: '#ffffff', // Main secondary color
    600: '#d4d4d4',
    700: '#a3a3a3',
    800: '#737373',
    900: '#525252',
  },

  // Tertiary/Accent colors
  tertiary: {
    50: '#fef7e6',
    100: '#fdecc7',
    200: '#fbd98f',
    300: '#f9c657',
    400: '#f7b31f',
    500: '#e8a812', // Main tertiary color
    600: '#c4900f',
    700: '#9f780c',
    800: '#7a6009',
    900: '#554806',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Special colors
  black: '#000000',
  white: '#ffffff',
  transparent: 'transparent',
} as const;

// Semantic color aliases for easy access
export const SemanticColors = {
  primary: ColorPalette.primary[500],
  secondary: ColorPalette.secondary[500],
  tertiary: ColorPalette.tertiary[500],
  success: ColorPalette.success[500],
  warning: ColorPalette.warning[500],
  error: ColorPalette.error[500],
  info: ColorPalette.info[500],
  background: ColorPalette.white,
  surface: ColorPalette.gray[50],
  border: ColorPalette.gray[200],
  text: ColorPalette.gray[900],
  textSecondary: ColorPalette.gray[600],
  textTertiary: ColorPalette.gray[400],
  placeholder: ColorPalette.gray[400],
  disabled: ColorPalette.gray[300],
} as const;

// Theme-specific colors extending the existing system
export const ExtendedColors = {
  light: {
    text: SemanticColors.text,
    background: SemanticColors.background,
    tint: ColorPalette.primary[500],
    icon: SemanticColors.textSecondary,
    tabIconDefault: SemanticColors.textSecondary,
    tabIconSelected: ColorPalette.primary[500],
    border: SemanticColors.border,
    surface: SemanticColors.surface,
    placeholder: SemanticColors.placeholder,
    disabled: SemanticColors.disabled,
    success: SemanticColors.success,
    warning: SemanticColors.warning,
    error: SemanticColors.error,
    info: SemanticColors.info,
  },
  dark: {
    text: ColorPalette.gray[100],
    background: ColorPalette.gray[900],
    tint: ColorPalette.gray[100],
    icon: ColorPalette.gray[400],
    tabIconDefault: ColorPalette.gray[400],
    tabIconSelected: ColorPalette.gray[100],
    border: ColorPalette.gray[700],
    surface: ColorPalette.gray[800],
    placeholder: ColorPalette.gray[500],
    disabled: ColorPalette.gray[600],
    success: ColorPalette.success[400],
    warning: ColorPalette.warning[400],
    error: ColorPalette.error[400],
    info: ColorPalette.info[400],
  },
  button: {
    primary: {
      text: secondaryColor,
      background: primaryColor,
    },
    secondary: {
      text: primaryColor,
      background: secondaryColor,
    },
    tertiary: {
      text: primaryColor,
      background: tertiaryColor,
    },
    success: {
      text: secondaryColor,
      background: SemanticColors.success,
    },
    warning: {
      text: secondaryColor,
      background: SemanticColors.warning,
    },
    error: {
      text: secondaryColor,
      background: SemanticColors.error,
    },
    ghost: {
      text: ColorPalette.primary[500],
      background: 'transparent',
    },
  },
} as const;
