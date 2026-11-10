/**
 * Design System Badge Component
 * Color-coded status pill (Aduan status, Bancian state, etc.)
 */

import { BorderRadius, ColorPalette, Spacing, StatusColors, Typography } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { View } from 'react-native';

export type StatusBadgeStatus = keyof typeof StatusColors;

export interface StatusBadgeProps {
  label: string;
  status: StatusBadgeStatus;
  style?: StyleProp<ViewStyle>;
}

export function StatusBadge({ label, status, style }: StatusBadgeProps) {
  const color = StatusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: color }, style]}>
      <Text style={styles.text} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.white,
  },
});
