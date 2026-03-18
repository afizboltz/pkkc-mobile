import { useTranslation } from '@/src/i18n';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Alert, Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/src/components/ui/Card';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.sm * 2 - Spacing.sm) / 2;

interface ComplaintCategory {
    id: string;
    title: string;
    description: string;
    link: string;
    incharge: string;
}

interface EmergencyContact {
    id: string;
    name: string;
    department: string;
    phone: string;
    email?: string;
    isEmergency: boolean;
}

const complaintCategories: ComplaintCategory[] = [
    { id: '1', title: 'Aduan Kemudah', description: 'Masalah dengan kemudahan', link: 'https://example.com/complaint/facilities', incharge: 'Jabatan Kemudahan' },
    { id: '2', title: 'Aduan Kebersihan', description: 'Isu kebersihan kawasan', link: 'https://example.com/complaint/cleanliness', incharge: 'Jabatan Kebersihan' },
    { id: '3', title: 'Aduan Keselamatan', description: 'Isu keselamatan', link: 'https://example.com/complaint/security', incharge: 'Jabatan Keselamatan' },
    { id: '4', title: 'Aduan Lain-lain', description: 'Aduan umum', link: 'https://example.com/complaint/general', incharge: 'Pentadbiran' }
];

const emergencyContacts: EmergencyContact[] = [
    { id: '1', name: 'Pejabat PKKC', department: 'Pentadbiran', phone: '03-12345678', email: 'info@pkkc.org', isEmergency: false },
    { id: '2', name: 'Keselamatan', department: 'Keselamatan', phone: '019-8765432', isEmergency: true },
    { id: '3', name: 'Bomb & Penyelamat', department: 'Kecemasan', phone: '999', isEmergency: true },
    { id: '4', name: 'Polis', department: 'Kecemasan', phone: '999', isEmergency: true },
    { id: '5', name: 'Ambulan', department: 'Kecemasan', phone: '999', isEmergency: true }
];

export default function DirectoryScreen() {
    const { t } = useTranslation();

    const handleComplaintPress = (complaint: ComplaintCategory) => {
        Alert.alert(`Buat Aduan: ${complaint.title}`, `Aduan akan dihantar kepada ${complaint.incharge}`, [
            { text: 'Batal', style: 'cancel' },
            { text: 'Buka', onPress: () => Linking.openURL(complaint.link).catch(() => Alert.alert('Ralat', 'Tidak dapat membuka pautan.')) }
        ]);
    };

    const handlePhoneCall = (phone: string) => {
        Alert.alert('Panggilan Telefon', `Anda akan memanggil ${phone}`, [
            { text: 'Batal', style: 'cancel' },
            { text: 'Panggil', onPress: () => Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Ralat', 'Tidak dapat membuat panggilan.')) }
        ]);
    };

    const handleEmailPress = (email: string) => {
        Linking.openURL(`mailto:${email}`).catch(() => Alert.alert('Ralat', 'Tidak dapat membuka emel.'));
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Animated.View style={styles.header} entering={FadeInDown.duration(500).springify()}>
                    <View style={styles.headerIconContainer}>
                        <MaterialIcons name="contact-phone" size={32} color={ColorPalette.white} />
                    </View>
                    <Text style={styles.headerTitle}>Direktori</Text>
                    <Text style={styles.headerSubtitle}>Aduan & Kecemasan</Text>
                </Animated.View>

                <Animated.View style={styles.section} entering={FadeInUp.duration(500).delay(100).springify()}>
                    <Card variant="elevated" padding="md">
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: `${ColorPalette.warning[500]}15` }]}>
                                <MaterialIcons name="report-problem" size={20} color={ColorPalette.warning[500]} />
                            </View>
                            <View style={styles.sectionTextContainer}>
                                <Text style={styles.sectionTitle}>Buat Aduan</Text>
                                <Text style={styles.sectionDescription} numberOfLines={2}>Pilih kategori aduan</Text>
                            </View>
                        </View>
                        <View style={styles.complaintGrid}>
                            {complaintCategories.map((complaint, index) => (
                                <Animated.View key={complaint.id} entering={FadeInUp.duration(400).delay(200 + index * 50)}>
                                    <TouchableOpacity style={styles.complaintCard} onPress={() => handleComplaintPress(complaint)} activeOpacity={0.7}>
                                        <View style={styles.complaintIconContainer}>
                                            <MaterialIcons name="description" size={24} color={ColorPalette.primary[500]} />
                                        </View>
                                        <Text style={styles.complaintTitle} numberOfLines={1}>{complaint.title}</Text>
                                        <Text style={styles.complaintDescription} numberOfLines={2}>{complaint.description}</Text>
                                        <Text style={styles.complaintIncharge} numberOfLines={1}>PIC: {complaint.incharge}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View style={styles.section} entering={FadeInUp.duration(500).delay(300).springify()}>
                    <Card variant="elevated" padding="md">
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: `${ColorPalette.error[500]}15` }]}>
                                <MaterialIcons name="phone-in-talk" size={20} color={ColorPalette.error[500]} />
                            </View>
                            <View style={styles.sectionTextContainer}>
                                <Text style={styles.sectionTitle}>Hubungan Kecemasan</Text>
                                <Text style={styles.sectionDescription} numberOfLines={2}>Nombor kecemasan</Text>
                            </View>
                        </View>
                        <View style={styles.contactsList}>
                            {emergencyContacts.map((contact, index) => (
                                <Animated.View key={contact.id} entering={FadeInUp.duration(400).delay(400 + index * 50)}>
                                    <View style={[styles.contactCard, contact.isEmergency && styles.emergencyCard]}>
                                        <View style={styles.contactInfo}>
                                            <View style={styles.contactHeader}>
                                                <Text style={[styles.contactName, contact.isEmergency && styles.emergencyText]} numberOfLines={1}>{contact.name}</Text>
                                                {contact.isEmergency && <View style={styles.emergencyBadge}><Text style={styles.emergencyBadgeText}>KECEMASAN</Text></View>}
                                            </View>
                                            <Text style={styles.contactDepartment} numberOfLines={1}>{contact.department}</Text>
                                            <View style={styles.buttonRow}>
                                                <TouchableOpacity style={[styles.phoneButton, contact.isEmergency && styles.emergencyPhoneButton]} onPress={() => handlePhoneCall(contact.phone)}>
                                                    <MaterialIcons name="call" size={14} color={contact.isEmergency ? ColorPalette.white : ColorPalette.primary[500]} />
                                                    <Text style={[styles.phoneNumber, contact.isEmergency && styles.emergencyPhoneText]}>{contact.phone}</Text>
                                                </TouchableOpacity>
                                                {contact.email && <TouchableOpacity style={styles.emailButton} onPress={() => handleEmailPress(contact.email!)}><MaterialIcons name="email" size={14} color={ColorPalette.primary[500]} /></TouchableOpacity>}
                                            </View>
                                        </View>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    </Card>
                </Animated.View>
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: ColorPalette.gray[50] },
    scrollContent: { flexGrow: 1 },
    header: { backgroundColor: ColorPalette.primary[500], padding: Spacing.lg, paddingTop: Spacing.xl, alignItems: 'center' },
    headerIconContainer: { width: 56, height: 56, borderRadius: BorderRadius.lg, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
    headerTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: ColorPalette.white },
    headerSubtitle: { fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    section: { padding: Spacing.sm },
    sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
    sectionTextContainer: { flex: 1 },
    sectionIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
    sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: ColorPalette.gray[900] },
    sectionDescription: { fontSize: Typography.fontSize.xs, color: ColorPalette.gray[500] },
    complaintGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.sm },
    complaintCard: { width: CARD_WIDTH, backgroundColor: ColorPalette.gray[50], padding: Spacing.sm, borderRadius: BorderRadius.md, alignItems: 'center' },
    complaintIconContainer: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: `${ColorPalette.primary[500]}10`, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
    complaintTitle: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold, color: ColorPalette.gray[800], textAlign: 'center' },
    complaintDescription: { fontSize: 10, color: ColorPalette.gray[500], marginTop: 2, textAlign: 'center' },
    complaintIncharge: { fontSize: 10, color: ColorPalette.primary[500], marginTop: 4, fontWeight: Typography.fontWeight.medium },
    contactsList: { gap: Spacing.sm },
    contactCard: { backgroundColor: ColorPalette.gray[50], padding: Spacing.sm, borderRadius: BorderRadius.md },
    emergencyCard: { borderWidth: 1.5, borderColor: ColorPalette.error[500], backgroundColor: ColorPalette.error[50] },
    contactInfo: { flex: 1 },
    contactHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
    contactName: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: ColorPalette.gray[800], flex: 1 },
    emergencyText: { color: ColorPalette.error[600] },
    emergencyBadge: { backgroundColor: ColorPalette.error[500], paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
    emergencyBadgeText: { color: ColorPalette.white, fontSize: 8, fontWeight: Typography.fontWeight.bold },
    contactDepartment: { fontSize: Typography.fontSize.xs, color: ColorPalette.gray[500] },
    buttonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
    phoneButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: Spacing.sm, backgroundColor: ColorPalette.gray[100], borderRadius: BorderRadius.sm },
    emergencyPhoneButton: { backgroundColor: ColorPalette.error[500] },
    phoneNumber: { fontSize: Typography.fontSize.xs, color: ColorPalette.primary[500], fontWeight: Typography.fontWeight.medium, marginLeft: 4 },
    emergencyPhoneText: { color: ColorPalette.white },
    emailButton: { padding: 6, backgroundColor: ColorPalette.gray[100], borderRadius: BorderRadius.sm },
    bottomSpacer: { height: Spacing.xl },
});
