/**
 * Design System ListRow Component
 * Icon + label (+ secondary line) + chevron/action row,
 * used by Profil, Keahlian, Dokumen, Komuniti hub, etc.
 */

import { BorderRadius, ColorPalette, Spacing, Typography } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface ListRowProps {
  icon?: string;
  iconColor?: string;
  label: string;
  labelColor?: string;
  secondaryLabel?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

export function ListRow({
  icon,
  iconColor = ColorPalette.primary[500],
  label,
  labelColor,
  secondaryLabel,
  rightElement,
  onPress,
  showChevron = true,
}: ListRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      {icon && (
        <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}1A` }]}>
          <MaterialIcons name={icon as any} size={20} color={iconColor} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.label, labelColor ? { color: labelColor } : null]} numberOfLines={1}>{label}</Text>
        {secondaryLabel ? <Text style={styles.secondaryLabel} numberOfLines={1}>{secondaryLabel}</Text> : null}
      </View>
      {rightElement}
      {onPress && showChevron && (
        <MaterialIcons name="chevron-right" size={22} color={ColorPalette.gray[400]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: ColorPalette.gray[900],
  },
  secondaryLabel: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.gray[500],
    marginTop: 2,
  },
});
