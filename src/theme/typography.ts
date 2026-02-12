/**
 * Typography System for PKKC Mobile App
 * Consistent text styling with predefined variants
 */

import { TextStyle } from 'react-native';
import { Typography as TypographyTokens } from './tokens';

export interface TypographyVariant {
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: TextStyle['textTransform'];
  fontFamily?: TextStyle['fontFamily'];
}

export const TypographyVariants: Record<string, TypographyVariant> = {
  // Display variants
  displayLarge: {
    fontSize: TypographyTokens.fontSize.huge,
    fontWeight: TypographyTokens.fontWeight.bold,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: TypographyTokens.fontSize.xxxl,
    fontWeight: TypographyTokens.fontWeight.bold,
    lineHeight: 40,
    letterSpacing: -0.25,
  },
  displaySmall: {
    fontSize: TypographyTokens.fontSize.xxl,
    fontWeight: TypographyTokens.fontWeight.semibold,
    lineHeight: 36,
  },

  // Headline variants
  headlineLarge: {
    fontSize: TypographyTokens.fontSize.xxl,
    fontWeight: TypographyTokens.fontWeight.semibold,
    lineHeight: 32,
  },
  headlineMedium: {
    fontSize: TypographyTokens.fontSize.xl,
    fontWeight: TypographyTokens.fontWeight.semibold,
    lineHeight: 28,
  },
  headlineSmall: {
    fontSize: TypographyTokens.fontSize.lg,
    fontWeight: TypographyTokens.fontWeight.medium,
    lineHeight: 24,
  },

  // Title variants
  titleLarge: {
    fontSize: TypographyTokens.fontSize.xl,
    fontWeight: TypographyTokens.fontWeight.semibold,
    lineHeight: 24,
  },
  titleMedium: {
    fontSize: TypographyTokens.fontSize.lg,
    fontWeight: TypographyTokens.fontWeight.medium,
    lineHeight: 22,
  },
  titleSmall: {
    fontSize: TypographyTokens.fontSize.base,
    fontWeight: TypographyTokens.fontWeight.medium,
    lineHeight: 20,
  },

  // Body variants
  bodyLarge: {
    fontSize: TypographyTokens.fontSize.base,
    fontWeight: TypographyTokens.fontWeight.normal,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: TypographyTokens.fontSize.sm,
    fontWeight: TypographyTokens.fontWeight.normal,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: TypographyTokens.fontSize.xs,
    fontWeight: TypographyTokens.fontWeight.normal,
    lineHeight: 16,
  },

  // Label variants
  labelLarge: {
    fontSize: TypographyTokens.fontSize.sm,
    fontWeight: TypographyTokens.fontWeight.semibold,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: TypographyTokens.fontSize.xs,
    fontWeight: TypographyTokens.fontWeight.medium,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: TypographyTokens.fontWeight.medium,
    lineHeight: 14,
    letterSpacing: 0.5,
  },

  // Special variants
  caption: {
    fontSize: TypographyTokens.fontSize.xs,
    fontWeight: TypographyTokens.fontWeight.normal,
    lineHeight: 16,
  },
  overline: {
    fontSize: 10,
    fontWeight: TypographyTokens.fontWeight.semibold,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  link: {
    fontSize: TypographyTokens.fontSize.base,
    fontWeight: TypographyTokens.fontWeight.medium,
    lineHeight: 24,
  },
  code: {
    fontSize: TypographyTokens.fontSize.sm,
    fontWeight: TypographyTokens.fontWeight.normal,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
} as const;

// Helper function to create text styles
export const createTextStyle = (variant: keyof typeof TypographyVariants): TextStyle => {
  const variantStyle = TypographyVariants[variant];
  return {
    fontSize: variantStyle.fontSize,
    fontWeight: variantStyle.fontWeight,
    lineHeight: variantStyle.lineHeight,
    letterSpacing: variantStyle.letterSpacing,
    ...(variantStyle.textTransform && { textTransform: variantStyle.textTransform }),
    ...(variantStyle.fontFamily && { fontFamily: variantStyle.fontFamily }),
  };
};

// Pre-computed styles for performance
export const TypographyStyles: Record<string, TextStyle> = Object.keys(TypographyVariants).reduce(
  (acc, key) => ({
    ...acc,
    [key]: createTextStyle(key as keyof typeof TypographyVariants),
  }),
  {}
) as Record<keyof typeof TypographyVariants, TextStyle>;

// Legacy compatibility with existing ThemedText
export const LegacyTypographyMap = {
  default: TypographyStyles.bodyLarge,
  title: TypographyStyles.headlineMedium,
  defaultSemiBold: TypographyStyles.bodyLarge,
  subtitle: TypographyStyles.titleMedium,
  link: TypographyStyles.link,
} as const;
