import { Button, EmptyState, LoginPrompt, SegmentedTabs, StatusBadge, type StatusBadgeStatus } from '@/src/components/ui';
import { useAccessLevel } from '@/src/hooks/useAccessLevel';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Complaint {
  id: string;
  title: string;
  location: string;
  description?: string;
  date: string;
  status: StatusBadgeStatus;
  mine: boolean;
}

const STATUS_LABELS: Record<StatusBadgeStatus, string> = {
  dalamTindakan: 'Dalam Tindakan',
  diterima: 'Diterima',
  selesaiAduan: 'Selesai',
  aktif: 'Aktif',
  selesaiBancian: 'Selesai',
};

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: '1',
    title: 'Jalan rosak di Jalan Utama',
    location: 'Jalan Masuk Utama Kita Cybersouth',
    date: '10 Okt 2026',
    status: 'dalamTindakan',
    mine: false,
  },
  {
    id: '2',
    title: 'Lampu jalan tidak berfungsi',
    location: 'Jalan Dahlia',
    date: '8 Okt 2026',
    status: 'diterima',
    mine: false,
  },
  {
    id: '3',
    title: 'Longgokan sampah',
    location: 'Taman Seri',
    date: '5 Okt 2026',
    status: 'selesaiAduan',
    mine: false,
  },
  {
    id: '4',
    title: 'Kawasan laluan pejalan kaki tidak selamat',
    location: 'Jalan Melur',
    date: '3 Okt 2026',
    status: 'dalamTindakan',
    mine: false,
  },
];

const SEGMENT_OPTIONS = [
  { key: 'senarai', label: 'Senarai Aduan' },
  { key: 'saya', label: 'Aduan Saya' },
];

const MONTHS_MS = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sep', 'Okt', 'Nov', 'Dis'];

function formatTodayMs(): string {
  const now = new Date();
  return `${now.getDate()} ${MONTHS_MS[now.getMonth()]} ${now.getFullYear()}`;
}

function ComplaintRow({ item }: { item: Complaint }) {
  return (
    <View style={styles.complaintCard}>
      <Text style={styles.complaintTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.complaintMetaRow}>
        <MaterialIcons name="place" size={14} color={ColorPalette.gray[500]} />
        <Text style={styles.complaintMetaText} numberOfLines={1}>{item.location}</Text>
      </View>
      {item.description ? (
        <Text style={styles.complaintDescription} numberOfLines={3}>{item.description}</Text>
      ) : null}
      <View style={styles.complaintFooterRow}>
        <Text style={styles.complaintDate}>{item.date}</Text>
        <StatusBadge label={STATUS_LABELS[item.status]} status={item.status} />
      </View>
    </View>
  );
}

export default function AduanScreen() {
  const accessLevel = useAccessLevel();
  const [segment, setSegment] = useState<string>('senarai');
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const visibleComplaints = useMemo(
    () => (segment === 'senarai' ? MOCK_COMPLAINTS : myComplaints),
    [segment, myComplaints]
  );

  const resetForm = () => {
    setFormTitle('');
    setFormLocation('');
    setFormDescription('');
  };

  const handleSubmit = () => {
    if (!formTitle.trim() || !formLocation.trim()) return;
    const newComplaint: Complaint = {
      id: `mine-${Date.now()}`,
      title: formTitle.trim(),
      location: formLocation.trim(),
      description: formDescription.trim() || undefined,
      date: formatTodayMs(),
      status: 'diterima',
      mine: true,
    };
    setMyComplaints((prev) => [newComplaint, ...prev]);
    resetForm();
    setFormVisible(false);
    setSegment('saya');
  };

  if (accessLevel === 'guest') {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Aduan & Cadangan</Text>
        <LoginPrompt message="Log masuk untuk menghantar atau melihat aduan anda." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Aduan & Cadangan</Text>
        <Text style={styles.headerSubtitle}>
          Bersama kita wujudkan persekitaran yang lebih selesa dan selamat. Hantar aduan atau cadangan anda di sini.
        </Text>

        <Button variant="accent" fullWidth onPress={() => setFormVisible(true)} style={styles.createButton}>
          + Buat Aduan
        </Button>

        <View style={styles.segmentWrapper}>
          <SegmentedTabs options={SEGMENT_OPTIONS} selectedKey={segment} onSelect={setSegment} />
        </View>

        {visibleComplaints.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Tiada aduan lagi"
            message="Aduan yang anda hantar akan dipaparkan di sini."
          />
        ) : (
          <View style={styles.list}>
            {visibleComplaints.map((item) => (
              <ComplaintRow key={item.id} item={item} />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Buat Aduan</Text>
              <TouchableOpacity onPress={() => setFormVisible(false)}>
                <MaterialIcons name="close" size={24} color={ColorPalette.gray[500]} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Tajuk Aduan</Text>
            <TextInput
              style={styles.input}
              placeholder="Cth: Jalan rosak"
              placeholderTextColor={ColorPalette.gray[400]}
              value={formTitle}
              onChangeText={setFormTitle}
            />

            <Text style={styles.inputLabel}>Lokasi</Text>
            <TextInput
              style={styles.input}
              placeholder="Cth: Jalan Dahlia"
              placeholderTextColor={ColorPalette.gray[400]}
              value={formLocation}
              onChangeText={setFormLocation}
            />

            <Text style={styles.inputLabel}>Keterangan</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Terangkan aduan anda dengan lebih lanjut"
              placeholderTextColor={ColorPalette.gray[400]}
              value={formDescription}
              onChangeText={setFormDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Button
              variant="accent"
              fullWidth
              onPress={handleSubmit}
              disabled={!formTitle.trim() || !formLocation.trim()}
              style={styles.submitButton}
            >
              Hantar
            </Button>
          </View>
        </View>
      </Modal>
    </View>
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
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[500],
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  createButton: {
    marginBottom: Spacing.md,
  },
  segmentWrapper: {
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  complaintCard: {
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  complaintTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.gray[900],
    marginBottom: 4,
  },
  complaintMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  complaintMetaText: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.gray[500],
    flexShrink: 1,
  },
  complaintDescription: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[600],
    marginBottom: Spacing.sm,
  },
  complaintFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  complaintDate: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.gray[400],
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: ColorPalette.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: ColorPalette.gray[700],
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: ColorPalette.gray[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[900],
  },
  textArea: {
    minHeight: 90,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
