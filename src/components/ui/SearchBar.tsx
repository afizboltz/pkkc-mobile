/**
 * Design System SearchBar Component
 * Extracted from the original marketplace.tsx inline search box
 */

import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Cari...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={ColorPalette.gray[400]} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={ColorPalette.gray[400]}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={20} color={ColorPalette.gray[400]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: ColorPalette.gray[200],
    ...Shadow.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[700],
  },
});
