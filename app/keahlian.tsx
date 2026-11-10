import { Avatar, Button, ListRow, QRCodeCard } from '@/src/components/ui';
import { useAuth } from '@/src/hooks/useAuth';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';

const MOCK_PKKC_ID = 'PKKC2026-0123';

export default function KeahlianScreen() {
  const { userProfile } = useAuth();

  const memberNo = userProfile?.pkkcID || MOCK_PKKC_ID;

  const feeStatusLabel = (() => {
    if (!userProfile?.membershipExpiry) return 'Tidak aktif';
    const expiry = dayjs(userProfile.membershipExpiry);
    if (!expiry.isValid()) return 'Tidak aktif';
    return expiry.isAfter(dayjs())
      ? `Sah sehingga ${expiry.format('D MMM YYYY')}`
      : 'Tamat tempoh';
  })();

  const showPersonalInfo = () => {
    const lines = [
      userProfile?.fullName ? `Nama: ${userProfile.fullName}` : null,
      userProfile?.email ? `Emel: ${userProfile.email}` : null,
      userProfile?.phoneNo ? `Telefon: ${userProfile.phoneNo}` : null,
      userProfile?.icNo ? `No. IC: ${userProfile.icNo}` : null,
    ].filter(Boolean);
    Alert.alert('Maklumat Peribadi', lines.length ? lines.join('\n') : 'Maklumat tidak tersedia.');
  };

  const showBenefits = () => {
    Alert.alert(
      'Kelebihan Ahli',
      '• Diskaun istimewa dengan peniaga komuniti\n• Pendaftaran awal untuk program & aktiviti\n• Hak mengundi dalam AGM & bancian komuniti'
    );
  };

  const showFaq = () => {
    Alert.alert(
      'FAQ Keahlian',
      'S: Bagaimana cara memperbaharui keahlian?\nJ: Guna butang "Perbaharui Keahlian" di skrin ini.\n\nS: Bolehkah saya tukar maklumat peribadi?\nJ: Hubungi pejabat PKKC melalui Hubungan Kecemasan.'
    );
  };

  const showDigitalCard = () => {
    Alert.alert('Kad Digital', 'Ini ialah kad keahlian digital anda.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <Avatar name={userProfile?.fullName} size={72} />
        <Text style={styles.name}>{userProfile?.fullName ?? 'Ahli PKKC'}</Text>
        <Text style={styles.memberNo}>No. Ahli: {memberNo}</Text>
        <View style={styles.activePill}>
          <Text style={styles.activePillText}>Ahli Aktif</Text>
        </View>

        <View style={styles.qrWrapper}>
          <QRCodeCard value={memberNo} size={150} />
        </View>

        <Button variant="accent" fullWidth onPress={showDigitalCard} style={styles.cardButton}>
          Lihat Kad Digital
        </Button>
      </View>

      <View style={styles.listPanel}>
        <ListRow icon="person" label="Maklumat Peribadi" onPress={showPersonalInfo} />
        <ListRow
          icon="payments"
          label="Status Yuran"
          secondaryLabel={feeStatusLabel}
          onPress={() => Alert.alert('Status Yuran', feeStatusLabel)}
        />
        <ListRow icon="stars" label="Kelebihan Ahli" onPress={showBenefits} />
        <ListRow icon="autorenew" label="Perbaharui Keahlian" onPress={() => router.push('/renewMembership')} />
        <ListRow icon="help-outline" label="FAQ Keahlian" onPress={showFaq} />
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
  },
  scrollContent: {
    padding: Spacing.md,
  },
  heroCard: {
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.md,
  },
  name: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extrabold,
    color: ColorPalette.gray[900],
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  memberNo: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[500],
    marginTop: 2,
  },
  activePill: {
    marginTop: Spacing.sm,
    backgroundColor: ColorPalette.success[500],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  activePillText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.white,
  },
  qrWrapper: {
    marginTop: Spacing.lg,
  },
  cardButton: {
    marginTop: Spacing.lg,
  },
  listPanel: {
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    ...Shadow.sm,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
