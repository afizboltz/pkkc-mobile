import { ListRow } from '@/src/components/ui';
import { useAccessLevel } from '@/src/hooks/useAccessLevel';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ColorPalette, Spacing, Typography } from '@/src/theme';

export default function KomunitiScreen() {
  const accessLevel = useAccessLevel();
  const isMember = accessLevel === 'member';

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Komuniti</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.listPanel}>
          <ListRow icon="storefront" label="Direktori Peniaga" onPress={() => router.push('/direktoriPeniaga' as any)} />
          {isMember && (
            <ListRow icon="badge" label="Keahlian PKKC" onPress={() => router.push('/keahlian' as any)} />
          )}
          {isMember && (
            <ListRow icon="how-to-vote" label="Bancian & Undian" onPress={() => router.push('/bancian' as any)} />
          )}
          {isMember && (
            <ListRow icon="description" label="Dokumen" onPress={() => router.push('/dokumen' as any)} />
          )}
          <ListRow icon="account-tree" label="Organisasi PKKC" onPress={() => router.push('/organisation')} />
          {isMember && (
            <ListRow icon="how-to-reg" label="AGM" onPress={() => router.push('/agm')} />
          )}
          <ListRow icon="emergency" label="Hubungan Kecemasan" onPress={() => router.push('/directory')} showChevron />
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
    padding: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.extrabold,
    color: ColorPalette.gray[900],
    marginBottom: Spacing.md,
  },
  listPanel: {
    backgroundColor: ColorPalette.white,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
