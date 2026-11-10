/**
 * Design System LoginPrompt Component
 * Inline "sign in required" banner shown to guests in place of a gated action
 */

import { BorderRadius, ColorPalette, Spacing, Typography } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

export interface LoginPromptProps {
  message: string;
  ctaLabel?: string;
}

export function LoginPrompt({ message, ctaLabel = 'Log Masuk' }: LoginPromptProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="lock-outline" size={20} color={ColorPalette.brandPink[600]} />
      <Text style={styles.message}>{message}</Text>
      <Button variant="accent" size="sm" onPress={() => router.push('/login')}>
        {ctaLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: ColorPalette.brandPink[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  message: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[700],
  },
});
