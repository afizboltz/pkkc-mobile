/**
 * Design System ChipGroup Component
 * Horizontally-scrollable single-select filter chips
 */

import { Spacing } from '@/src/theme';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from './Chip';

export interface ChipGroupOption {
  key: string;
  label: string;
}

export interface ChipGroupProps {
  options: ChipGroupOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function ChipGroup({ options, selectedKey, onSelect }: ChipGroupProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {options.map((option) => (
        <Chip
          key={option.key}
          label={option.label}
          selected={option.key === selectedKey}
          onPress={() => onSelect(option.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  content: {
    paddingRight: Spacing.sm,
  },
});
