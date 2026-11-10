import { ChipGroup, EmptyState, MemberOnlyGate } from '@/src/components/ui';
import { getAnnouncements } from '@/src/services/announcement';
import { printLog } from '@/src/utils/log';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';

type NotificationCategory = 'hebahan' | 'program' | 'aduan';

interface NotificationItem {
  id: string;
  category: NotificationCategory;
  icon: string;
  title: string;
  message: string;
  timestamp: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'mock-1',
    category: 'program',
    icon: 'event',
    title: 'Program Akan Datang',
    message: 'Pendaftaran Kita Sports Day 1.0 kini dibuka.',
    timestamp: '7 Okt 2026, 11:00 pg',
  },
  {
    id: 'mock-2',
    category: 'aduan',
    icon: 'build',
    title: 'Status Aduan Dikemaskini',
    message: "Aduan anda 'Lampu jalan tidak berfungsi' telah dikemas kini kepada Dalam Tindakan.",
    timestamp: '8 Okt 2026, 3:15 ptg',
  },
  {
    id: 'mock-3',
    category: 'program',
    icon: 'description',
    title: 'Dokumen Baharu',
    message: 'Laporan Aktiviti & Program 2025 kini telah dimuat naik.',
    timestamp: '7 Okt 2026, 9:00 pg',
  },
];

const FILTER_OPTIONS = [
  { key: 'semua', label: 'Semua' },
  { key: 'hebahan', label: 'Hebahan' },
  { key: 'program', label: 'Program' },
  { key: 'aduan', label: 'Aduan' },
];

export default function NotifikasiScreen() {
  const [filter, setFilter] = useState<string>('semua');
  const [announcementItems, setAnnouncementItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const announcements = await getAnnouncements();
        if (!isMounted) return;
        setAnnouncementItems(
          announcements.map((a) => ({
            id: `announcement-${a.id}`,
            category: 'hebahan' as const,
            icon: 'campaign',
            title: a.title ?? '',
            message: a.message ?? a.description ?? '',
            timestamp: dayjs(a.createdAt ?? a.date).format('D MMM YYYY, h:mm A'),
          }))
        );
      } catch (e: any) {
        printLog('notifikasiAnnouncementFetchError', e?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const allItems = useMemo(
    () => [...announcementItems, ...MOCK_NOTIFICATIONS],
    [announcementItems]
  );

  const visibleItems = useMemo(
    () => (filter === 'semua' ? allItems : allItems.filter((item) => item.category === filter)),
    [allItems, filter]
  );

  return (
    <MemberOnlyGate title="Notifikasi" message="Log masuk untuk melihat notifikasi anda.">
    <View style={styles.container}>
      <View style={styles.chipWrapper}>
        <ChipGroup options={FILTER_OPTIONS} selectedKey={filter} onSelect={setFilter} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={ColorPalette.brandPink[500]} />
      ) : visibleItems.length === 0 ? (
        <EmptyState
          icon="notifications-none"
          title="Tiada notifikasi"
          message="Notifikasi baharu akan dipaparkan di sini."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {visibleItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.iconWrapper}>
                <MaterialIcons name={item.icon as any} size={20} color={ColorPalette.brandPink[600]} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                {item.message ? <Text style={styles.message} numberOfLines={3}>{item.message}</Text> : null}
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
    </MemberOnlyGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
    padding: Spacing.md,
  },
  chipWrapper: {
    marginBottom: Spacing.md,
  },
  loader: {
    marginTop: Spacing.xxl,
  },
  list: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: ColorPalette.brandPink[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
  },
  message: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.gray[600],
    marginTop: 2,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.gray[400],
    marginTop: Spacing.xs,
  },
});
