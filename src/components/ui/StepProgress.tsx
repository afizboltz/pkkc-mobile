/**
 * Design System StepProgress Component
 * "Step X of N" label + segmented progress bar for multi-step forms
 */

import { BorderRadius, ColorPalette, Spacing, Typography } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface StepProgressProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
  stepLabel: string;
  stepText: string; // e.g. "Step" / "Langkah"
  ofText: string; // e.g. "of" / "daripada"
}

export function StepProgress({ currentStep, totalSteps, stepLabel, stepText, ofText }: StepProgressProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {stepText} {currentStep + 1} {ofText} {totalSteps} — {stepLabel}
      </Text>
      <View style={styles.track}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i <= currentStep ? styles.segmentActive : styles.segmentInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: ColorPalette.gray[700],
  },
  track: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: BorderRadius.full,
  },
  segmentActive: {
    backgroundColor: ColorPalette.primary[500],
  },
  segmentInactive: {
    backgroundColor: ColorPalette.gray[200],
  },
});
