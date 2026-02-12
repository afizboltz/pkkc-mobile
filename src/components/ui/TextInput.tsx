/**
 * Design System TextInput Component
 * Standardized input field with consistent styling and states
 */

import { useThemeColor } from '@/src/hooks/useThemeColor';
import { BorderRadius, ColorPalette, ExtendedColors, Spacing, Typography } from '@/src/theme';
import React from 'react';
import {
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  View,
  type TextInputProps as RNTextInputProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>; // For backward compatibility
}

export function TextInput({
  label,
  error,
  helper,
  variant = 'outlined',
  size = 'md',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  style, // For backward compatibility
  ...props
}: TextInputProps) {
  const textColor = useThemeColor({ light: undefined, dark: undefined }, 'text');
  const borderColor = useThemeColor({ light: undefined, dark: undefined }, 'background');

  const getInputStyles = (): StyleProp<TextStyle> => {
    const baseStyle: TextStyle = {
      borderRadius: BorderRadius.md,
      fontSize: Typography.fontSize.base,
      lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
      color: textColor,
    };

    const sizeStyles = {
      sm: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        minHeight: 32,
        fontSize: Typography.fontSize.sm,
      },
      md: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 40,
        fontSize: Typography.fontSize.base,
      },
      lg: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        minHeight: 48,
        fontSize: Typography.fontSize.lg,
      },
    };

    const variantStyles = {
      outlined: {
        borderWidth: 1,
        borderColor: error ? ExtendedColors.light.error : ExtendedColors.light.border,
        backgroundColor: ExtendedColors.light.background,
      },
      filled: {
        borderWidth: 0,
        backgroundColor: ExtendedColors.light.surface,
        borderBottomWidth: 2,
        borderBottomColor: error ? ExtendedColors.light.error : ExtendedColors.light.border,
      },
    };

    const finalStyles: StyleProp<TextStyle>[] = [
      styles.input,
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
    ];

    if (leftIcon) {
      finalStyles.push({ paddingLeft: Spacing.xl });
    }

    if (rightIcon) {
      finalStyles.push({ paddingRight: Spacing.xl });
    }

    finalStyles.push(inputStyle);

    return finalStyles;
  };

  const getContainerStyles = (): StyleProp<ViewStyle> => {
    return [
      styles.container,
      containerStyle,
      style, // Add backward compatibility style
    ];
  };

  const getIconContainerStyles = (position: 'left' | 'right'): StyleProp<ViewStyle> => {
    return [
      styles.iconContainer,
      position === 'left' ? styles.iconLeft : styles.iconRight,
    ];
  };

  return (
    <View style={getContainerStyles()}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={styles.inputWrapper}>
        {leftIcon && (
          <View style={getIconContainerStyles('left')}>
            {leftIcon}
          </View>
        )}

        <RNTextInput
          style={getInputStyles()}
          placeholderTextColor={ExtendedColors.light.placeholder}
          {...props}
        />

        {rightIcon && (
          <View style={getIconContainerStyles('right')}>
            {rightIcon}
          </View>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {helper && !error && (
        <Text style={styles.helperText}>{helper}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: ExtendedColors.light.text,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconLeft: {
    left: Spacing.md,
  },
  iconRight: {
    right: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: ExtendedColors.light.error,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.gray[600],
  },
});
