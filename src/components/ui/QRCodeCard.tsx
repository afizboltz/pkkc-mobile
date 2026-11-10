/**
 * Design System QRCodeCard Component
 * Wraps react-native-qrcode-svg for the Keahlian PKKC digital membership card
 */

import { BorderRadius, ColorPalette, Spacing } from '@/src/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export interface QRCodeCardProps {
  value: string;
  size?: number;
}

export function QRCodeCard({ value, size = 160 }: QRCodeCardProps) {
  return (
    <View style={styles.container}>
      <QRCode value={value} size={size} color={ColorPalette.gray[900]} backgroundColor={ColorPalette.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
