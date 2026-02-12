/**
 * Design System Card Component
 * Standardized card container with consistent spacing and shadows
 */

import { useThemeColor } from '@/src/hooks/useThemeColor';
import { BorderRadius, ExtendedColors, Shadow, Spacing } from '@/src/theme';
import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
}: CardProps) {
  const backgroundColor = useThemeColor({ light: undefined, dark: undefined }, 'background');

  const getCardStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: ExtendedColors.light.border,
          backgroundColor: ExtendedColors.light.surface,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: ExtendedColors.light.surface,
          ...Shadow.sm,
        };
      case 'elevated':
      default:
        return {
          ...baseStyle,
          backgroundColor: ExtendedColors.light.surface,
          ...Shadow.md,
        };
    }
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {};
      case 'sm':
        return { padding: Spacing.sm };
      case 'lg':
        return { padding: Spacing.lg };
      case 'md':
      default:
        return { padding: Spacing.md };
    }
  };

  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    getCardStyles(),
    getPaddingStyle(),
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
});
