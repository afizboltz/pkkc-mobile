import { ChipGroup, EventCard, LoginPrompt, SegmentedTabs } from '@/src/components/ui';
import { useAccessLevel } from '@/src/hooks/useAccessLevel';
import { ColorPalette, Spacing, Typography } from '@/src/theme';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

type ProgramStatus = 'akanDatang' | 'lepas';
type ProgramCategory = 'sukan' | 'komuniti' | 'kebajikan';

interface ProgramItem {
  id: string;
  title: string;
  category: ProgramCategory;
  status: ProgramStatus;
  date: string;
  location: string;
  attendeeCount: number;
  imageUrl: string;
}

const MOCK_PROGRAMS: ProgramItem[] = [
  {
    id: '1',
    title: 'KITA SPORTS DAY 1.0',
    category: 'sukan',
    status: 'akanDatang',
    date: '25-26 Jul 2026',
    location: 'Padang Komuniti Kita Cybersouth',
    attendeeCount: 120,
    imageUrl: 'https://picsum.photos/400/300?random=101',
  },
  {
    id: '2',
    title: 'BOWLING TOURNAMENT',
    category: 'sukan',
    status: 'akanDatang',
    date: '2 Mei 2026',
    location: 'Ampang Superbowl, IOI City Mall',
    attendeeCount: 84,
    imageUrl: 'https://picsum.photos/400/300?random=102',
  },
  {
    id: '3',
    title: 'HARI BERSAMA AGENSI',
    category: 'komuniti',
    status: 'akanDatang',
    date: '25 Apr 2026',
    location: 'Dewan Komuniti Kita Cybersouth',
    attendeeCount: 68,
    imageUrl: 'https://picsum.photos/400/300?random=103',
  },
  {
    id: '4',
    title: 'Kempen Derma Darah',
    category: 'kebajikan',
    status: 'akanDatang',
    date: '14 Jun 2026',
    location: 'Dewan Komuniti Kita Cybersouth',
    attendeeCount: 45,
    imageUrl: 'https://picsum.photos/400/300?random=104',
  },
  {
    id: '5',
    title: 'Agihan Bantuan Hari Raya',
    category: 'kebajikan',
    status: 'lepas',
    date: '18 Mac 2026',
    location: 'Dewan Komuniti Kita Cybersouth',
    attendeeCount: 150,
    imageUrl: 'https://picsum.photos/400/300?random=105',
  },
  {
    id: '6',
    title: 'Gotong-Royong Perdana',
    category: 'komuniti',
    status: 'lepas',
    date: '1 Feb 2026',
    location: 'Taman Komuniti Kita Cybersouth',
    attendeeCount: 96,
    imageUrl: 'https://picsum.photos/400/300?random=106',
  },
];

const STATUS_OPTIONS = [
  { key: 'akanDatang', label: 'Akan Datang' },
  { key: 'lepas', label: 'Program Lepas' },
];

const CATEGORY_OPTIONS = [
  { key: 'semua', label: 'Semua' },
  { key: 'sukan', label: 'Sukan' },
  { key: 'komuniti', label: 'Komuniti' },
  { key: 'kebajikan', label: 'Kebajikan' },
];

export default function ProgramScreen() {
  const accessLevel = useAccessLevel();
  const [status, setStatus] = useState<string>('akanDatang');
  const [category, setCategory] = useState<string>('semua');

  const filteredPrograms = useMemo(
    () =>
      MOCK_PROGRAMS.filter(
        (p) => p.status === status && (category === 'semua' || p.category === category)
      ),
    [status, category]
  );

  const handleRegister = () => {
    Alert.alert('Pendaftaran', 'Pendaftaran berjaya! Kami akan hubungi anda tidak lama lagi.');
  };

  if (accessLevel === 'guest') {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Program & Aktiviti</Text>
        <LoginPrompt message="Log masuk untuk melihat dan mendaftar program & aktiviti." />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>Program & Aktiviti</Text>

      <View style={styles.segmentWrapper}>
        <SegmentedTabs options={STATUS_OPTIONS} selectedKey={status} onSelect={setStatus} />
      </View>

      <View style={styles.chipWrapper}>
        <ChipGroup options={CATEGORY_OPTIONS} selectedKey={category} onSelect={setCategory} />
      </View>

      <View style={styles.list}>
        {filteredPrograms.map((item) => (
          <EventCard
            key={item.id}
            title={item.title}
            imageUrl={item.imageUrl}
            dateLabel={item.date}
            location={item.location}
            attendeeCount={item.attendeeCount}
            ctaLabel={item.status === 'akanDatang' ? 'Daftar Sekarang' : undefined}
            onPressCta={handleRegister}
          />
        ))}
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
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.extrabold,
    color: ColorPalette.gray[900],
    marginBottom: Spacing.md,
  },
  segmentWrapper: {
    marginBottom: Spacing.md,
  },
  chipWrapper: {
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
