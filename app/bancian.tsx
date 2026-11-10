import { Button, MemberOnlyGate, SegmentedTabs, StatusBadge } from '@/src/components/ui';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

interface SurveyItem {
  id: string;
  title: string;
  description: string;
  status: 'aktif' | 'selesai';
  deadline?: string;
  resultSummary?: string;
}

const MOCK_SURVEYS: SurveyItem[] = [
  {
    id: '1',
    title: 'Bancian Minat Peniaga Komuniti',
    description: 'Bantu kami menilai permintaan tapak niaga di Kita Cybersouth.',
    status: 'aktif',
    deadline: '31 Okt 2026',
  },
  {
    id: '2',
    title: 'Cadangan Program 2027',
    description: 'Kongsi cadangan program yang anda ingin libatkan.',
    status: 'aktif',
    deadline: '30 Nov 2026',
  },
  {
    id: '3',
    title: 'Undian Lokasi AGM 2027',
    description: 'Pilih lokasi pilihan anda.',
    status: 'aktif',
    deadline: '15 Nov 2026',
  },
  {
    id: '4',
    title: 'Bancian Kepuasan Program 2025',
    description: 'Penilaian keseluruhan terhadap program dan aktiviti sepanjang 2025.',
    status: 'selesai',
    resultSummary: 'Keputusan: 68% berpuas hati',
  },
  {
    id: '5',
    title: 'Undian Nama Rasmi Taman Komuniti',
    description: 'Pemilihan nama rasmi untuk taman komuniti baharu.',
    status: 'selesai',
    resultSummary: 'Keputusan: "Taman Seri Cybersouth" dipilih',
  },
];

const SEGMENT_OPTIONS = [
  { key: 'aktif', label: 'Aktif' },
  { key: 'selesai', label: 'Selesai' },
];

export default function BancianScreen() {
  const [segment, setSegment] = useState<string>('aktif');
  const [joinedIds, setJoinedIds] = useState<string[]>([]);

  const visibleSurveys = useMemo(
    () => MOCK_SURVEYS.filter((s) => s.status === segment),
    [segment]
  );

  const handleJoin = (item: SurveyItem) => {
    setJoinedIds((prev) => [...prev, item.id]);
    Alert.alert('Terima kasih', 'Respons anda telah direkodkan.');
  };

  return (
    <MemberOnlyGate title="Bancian / Undian" message="Log masuk untuk menyertai bancian dan undian komuniti.">
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.segmentWrapper}>
        <SegmentedTabs options={SEGMENT_OPTIONS} selectedKey={segment} onSelect={setSegment} />
      </View>

      <View style={styles.list}>
        {visibleSurveys.map((item) => {
          const hasJoined = joinedIds.includes(item.id);
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons
                    name={item.status === 'aktif' ? 'how-to-vote' : 'poll'}
                    size={22}
                    color={ColorPalette.white}
                  />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                </View>
                <StatusBadge
                  label={item.status === 'aktif' ? 'Aktif' : 'Selesai'}
                  status={item.status === 'aktif' ? 'aktif' : 'selesaiBancian'}
                />
              </View>

              <Text style={styles.cardDescription}>{item.description}</Text>

              {item.status === 'aktif' ? (
                <View style={styles.cardFooterRow}>
                  <Text style={styles.deadlineText}>Tutup: {item.deadline}</Text>
                  <Button
                    variant="accent"
                    size="sm"
                    onPress={() => handleJoin(item)}
                    disabled={hasJoined}
                  >
                    {hasJoined ? 'Sudah Disertai' : 'Sertai'}
                  </Button>
                </View>
              ) : (
                <Text style={styles.resultText}>{item.resultSummary}</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
    </MemberOnlyGate>
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
  segmentWrapper: {
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
  card: {
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadow.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: ColorPalette.brandPink[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
  },
  cardDescription: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[600],
    marginBottom: Spacing.md,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deadlineText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.gray[500],
  },
  resultText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.success[600],
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
