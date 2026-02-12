/**
 * Design System Button Component
 * Standardized button with multiple variants and sizes
 */

import { useThemeColor } from '@/src/hooks/useThemeColor';
import { BorderRadius, ColorPalette, ExtendedColors, Shadow, Spacing, Typography } from '@/src/theme';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  style,
  ...props
}: ButtonProps) {
  const theme = useThemeColor({ light: undefined, dark: undefined }, 'background');

  const getButtonColors = () => {
    const colors = ExtendedColors.button[variant];
    return {
      backgroundColor: colors.background,
      textColor: colors.text,
      borderColor: variant === 'ghost' ? ExtendedColors.light.border : 'transparent',
    };
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          button: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.xs,
            minHeight: 32,
          },
          text: {
            fontSize: Typography.fontSize.sm,
            fontWeight: Typography.fontWeight.medium,
          },
        };
      case 'lg':
        return {
          button: {
            paddingHorizontal: Spacing.xl,
            paddingVertical: Spacing.md,
            minHeight: 48,
          },
          text: {
            fontSize: Typography.fontSize.lg,
            fontWeight: Typography.fontWeight.semibold,
          },
        };
      default:
        return {
          button: {
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            minHeight: 40,
          },
          text: {
            fontSize: Typography.fontSize.base,
            fontWeight: Typography.fontWeight.medium,
          },
        };
    }
  };

  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();

  const buttonStyle: StyleProp<ViewStyle> = [
    styles.button,
    {
      backgroundColor: disabled ? ExtendedColors.light.disabled : colors.backgroundColor,
      borderColor: colors.borderColor,
      borderWidth: variant === 'ghost' ? 1 : 0,
      borderRadius: BorderRadius.md,
      ...Shadow.sm,
    },
    sizeStyles.button,
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyle: StyleProp<TextStyle> = [
    styles.text,
    {
      color: disabled ? ColorPalette.gray[400] : colors.textColor,
    },
    sizeStyles.text,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={colors.textColor}
          style={styles.spinner}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={textStyle}>{children}</Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  spinner: {
    marginHorizontal: Spacing.xs,
  },
});
