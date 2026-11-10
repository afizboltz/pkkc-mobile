/**
 * Design System SectionHeader Component
 * Section title + optional "Lihat Semua" action link
 */

import { ColorPalette, Spacing, Typography } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onPressAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onPressAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
  },
  action: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.brandPink[600],
  },
});
