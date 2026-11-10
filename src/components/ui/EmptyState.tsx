/**
 * Design System EmptyState Component
 * Standardized "no items yet" / "coming soon" block
 */

import { ColorPalette, Spacing, Typography } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
}

export function EmptyState({ icon = 'inbox', title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name={icon as any} size={48} color={ColorPalette.gray[300]} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.gray[600],
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[400],
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
