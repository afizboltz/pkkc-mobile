import { EmptyState } from '@/src/components/ui';
import { ColorPalette, Spacing } from '@/src/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function NotifikasiScreen() {
  return (
    <View style={styles.container}>
      <EmptyState icon="notifications" title="Notifikasi" message="Akan datang tidak lama lagi." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ColorPalette.gray[50], padding: Spacing.md },
});
