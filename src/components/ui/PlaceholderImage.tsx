/**
 * Design System PlaceholderImage Component
 * Fallback colored/icon tile for failed or offline image loads
 */

import { ColorPalette } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export interface PlaceholderImageProps {
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

export function PlaceholderImage({ icon = 'image', style }: PlaceholderImageProps) {
  return (
    <View style={[styles.container, style]}>
      <MaterialIcons name={icon as any} size={28} color={ColorPalette.gray[400]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPalette.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
