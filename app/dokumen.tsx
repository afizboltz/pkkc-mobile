import { ChipGroup, ListRow } from '@/src/components/ui';
import { ColorPalette, Spacing, Typography } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DocumentCategory = 'suratRasmi' | 'minit' | 'laporan';

interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  size: string;
  date: string;
}

const MOCK_DOCUMENTS: DocumentItem[] = [
  { id: '1', title: 'Minit AGM Kali Pertama (2024)', category: 'minit', size: '2.4 MB', date: '12 Sep 2026' },
  { id: '2', title: 'Laporan Kewangan Berakhir 31 Julai 2026', category: 'laporan', size: '1.8 MB', date: '10 Sep 2026' },
  { id: '3', title: 'Laporan Aktiviti & Program 2025', category: 'laporan', size: '3.1 MB', date: '5 Sep 2026' },
  { id: '4', title: 'Surat Rasmi kepada MP Sepang', category: 'suratRasmi', size: '1.2 MB', date: '1 Sep 2026' },
  { id: '5', title: 'Garis Panduan Permohonan Tapak Niaga', category: 'suratRasmi', size: '1.6 MB', date: '28 Ogos 2026' },
];

const CATEGORY_OPTIONS = [
  { key: 'semua', label: 'Semua' },
  { key: 'suratRasmi', label: 'Surat Rasmi' },
  { key: 'minit', label: 'Minit Mesyuarat' },
  { key: 'laporan', label: 'Laporan' },
];

export default function DokumenScreen() {
  const [category, setCategory] = useState<string>('semua');

  const filteredDocuments = useMemo(
    () => MOCK_DOCUMENTS.filter((doc) => category === 'semua' || doc.category === category),
    [category]
  );

  const onDownload = (title: string) => {
    Alert.alert('Muat Turun', 'Akan datang tidak lama lagi.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.chipWrapper}>
        <ChipGroup options={CATEGORY_OPTIONS} selectedKey={category} onSelect={setCategory} />
      </View>

      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ListRow
            icon="picture-as-pdf"
            iconColor={ColorPalette.error[500]}
            label={item.title}
            secondaryLabel={`${item.size} • ${item.date}`}
            showChevron={false}
            rightElement={
              <TouchableOpacity style={styles.downloadBtn} onPress={() => onDownload(item.title)}>
                <MaterialIcons name="file-download" size={20} color={ColorPalette.primary[600]} />
              </TouchableOpacity>
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="folder-open" size={48} color={ColorPalette.gray[300]} />
            <Text style={styles.emptyText}>Tiada dokumen dalam kategori ini</Text>
          </View>
        }
      />
    </View>
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
  listContent: {
    backgroundColor: ColorPalette.white,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: ColorPalette.gray[100],
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ColorPalette.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[400],
    marginTop: Spacing.md,
  },
});
