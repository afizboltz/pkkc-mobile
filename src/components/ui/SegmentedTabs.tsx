/**
 * Design System SegmentedTabs Component
 * Generic 2-4 way animated segmented control, based on the pattern
 * originally inlined in dashboard.tsx's BM/EN language switcher
 */

import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

export interface SegmentedTabOption {
  key: string;
  label: string;
}

export interface SegmentedTabsProps {
  options: SegmentedTabOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function SegmentedTabs({ options, selectedKey, onSelect }: SegmentedTabsProps) {
  const selectedIndex = Math.max(0, options.findIndex((o) => o.key === selectedKey));
  const segmentWidthPercent = 100 / options.length;

  return (
    <View style={styles.container}>
      <Animated.View
        layout={LinearTransition.duration(200)}
        style={[
          styles.thumb,
          {
            width: `${segmentWidthPercent}%`,
            left: `${segmentWidthPercent * selectedIndex}%`,
          },
        ]}
      />
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={styles.segment}
          onPress={() => onSelect(option.key)}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, option.key === selectedKey && styles.labelActive]} numberOfLines={1}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: ColorPalette.gray[100],
    borderRadius: BorderRadius.full,
    padding: 3,
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: ColorPalette.white,
    ...Shadow.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.gray[600],
  },
  labelActive: {
    color: ColorPalette.brandPink[600],
  },
});
