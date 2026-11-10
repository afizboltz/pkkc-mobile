/**
 * Design System Avatar Component
 * Circular avatar with image source or initials fallback
 */

import { ColorPalette, Typography } from '@/src/theme';
import React from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

export interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
}

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
  return initials || '?';
};

export function Avatar({ source, name, size = 44, style }: AvatarProps) {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (source) {
    return <Image source={source} style={[styles.image, dimensionStyle, style as StyleProp<ImageStyle>]} />;
  }

  return (
    <View style={[styles.fallback, dimensionStyle, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: ColorPalette.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.primary[800],
  },
});
