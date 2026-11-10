/**
 * Design System Chip Component
 * Single filter pill, used standalone or inside ChipGroup
 */

import { BorderRadius, ColorPalette, Spacing, Typography } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: ColorPalette.gray[100],
    marginRight: Spacing.sm,
  },
  chipSelected: {
    backgroundColor: ColorPalette.brandPink[500],
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: ColorPalette.gray[700],
  },
  labelSelected: {
    color: ColorPalette.white,
    fontWeight: Typography.fontWeight.semibold,
  },
});
