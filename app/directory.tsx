import { primaryColor } from '@/src/constants/Colors';
import { useTranslation } from '@/src/i18n';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Boilerplate data structures - you can fill these with actual data later
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

// BOILERPLATE DATA - Replace with actual data
const complaintCategories: ComplaintCategory[] = [
    {
        id: '1',
        title: 'Aduan Kemudahan',
        description: 'Masalah dengan kemudahan bangunan atau kawasan',
        link: 'https://example.com/complaint/facilities',
        incharge: 'Jabatan Kemudahan'
    },
    {
        id: '2',
        title: 'Aduan Kebersihan',
        description: 'Isu berkaitan kebersihan kawasan',
        link: 'https://example.com/complaint/cleanliness',
        incharge: 'Jabatan Kebersihan'
    },
    {
        id: '3',
        title: 'Aduan Keselamatan',
        description: 'Isu berkaitan keselamatan dan sekuriti',
        link: 'https://example.com/complaint/security',
        incharge: 'Jabatan Keselamatan'
    },
    {
        id: '4',
        title: 'Aduan Lain-lain',
        description: 'Aduan umum atau kategori lain',
        link: 'https://example.com/complaint/general',
        incharge: 'Pentadbiran'
    }
];

const emergencyContacts: EmergencyContact[] = [
    {
        id: '1',
        name: 'Pejabat Urusan PKKC',
        department: 'Pentadbiran',
        phone: '03-12345678',
        email: 'info@pkkc.org',
        isEmergency: false
    },
    {
        id: '2',
        name: 'Keselamatan (Security)',
        department: 'Keselamatan',
        phone: '019-8765432',
        isEmergency: true
    },
    {
        id: '3',
        name: 'Bomb dan Penyelamat',
        department: 'Kecemasan',
        phone: '999',
        isEmergency: true
    },
    {
        id: '4',
        name: 'Polis',
        department: 'Kecemasan',
        phone: '999',
        isEmergency: true
    },
    {
        id: '5',
        name: 'Ambulan',
        department: 'Kecemasan',
        phone: '999',
        isEmergency: true
    }
];

export default function DirectoryScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const handleComplaintPress = (complaint: ComplaintCategory) => {
        Alert.alert(
            `Buat Aduan: ${complaint.title}`,
            `Aduan anda akan dihantar kepada ${complaint.incharge}\n\nSistem akan membuka pautan aduan dalam pelayar.`,
            [
                {
                    text: 'Batal',
                    style: 'cancel'
                },
                {
                    text: 'Buka Aduan',
                    onPress: () => {
                        Linking.openURL(complaint.link).catch(() => {
                            Alert.alert('Ralat', 'Tidak dapat membuka pautan aduan. Sila cuba lagi.');
                        });
                    }
                }
            ]
        );
    };

    const handlePhoneCall = (phone: string) => {
        Alert.alert(
            'Panggilan Telefon',
            `Anda akan membuat panggilan ke ${phone}`,
            [
                {
                    text: 'Batal',
                    style: 'cancel'
                },
                {
                    text: 'Panggil',
                    onPress: () => {
                        Linking.openURL(`tel:${phone}`).catch(() => {
                            Alert.alert('Ralat', 'Tidak dapat membuat panggilan. Sila cuba lagi.');
                        });
                    }
                }
            ]
        );
    };

    const handleEmailPress = (email: string) => {
        Linking.openURL(`mailto:${email}`).catch(() => {
            Alert.alert('Ralat', 'Tidak dapat membuka aplikasi emel. Sila cuba lagi.');
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Direktori</Text>
                    <Text style={styles.headerSubtitle}>Aduan & Kecemasan</Text>
                </View>

                {/* Complaint Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="report-problem" size={24} color={primaryColor} />
                        <Text style={styles.sectionTitle}>Buat Aduan</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Pilih kategori aduan untuk dihantar kepada pihak berkenaan
                    </Text>

                    <View style={styles.complaintGrid}>
                        {complaintCategories.map((complaint) => (
                            <TouchableOpacity
                                key={complaint.id}
                                style={styles.complaintCard}
                                onPress={() => handleComplaintPress(complaint)}
                            >
                                <MaterialIcons name="description" size={32} color={primaryColor} />
                                <Text style={styles.complaintTitle}>{complaint.title}</Text>
                                <Text style={styles.complaintDescription}>{complaint.description}</Text>
                                <Text style={styles.complaintIncharge}>PIC: {complaint.incharge}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Emergency Contacts Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="phone-in-talk" size={24} color="#DC2626" />
                        <Text style={styles.sectionTitle}>Hubungan Kecemasan</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Hubungi nombor kecemasan untuk bantuan segera
                    </Text>

                    <View style={styles.contactsList}>
                        {emergencyContacts.map((contact) => (
                            <View key={contact.id} style={[
                                styles.contactCard,
                                contact.isEmergency && styles.emergencyCard
                            ]}>
                                <View style={styles.contactInfo}>
                                    <View style={styles.contactHeader}>
                                        <Text style={[
                                            styles.contactName,
                                            contact.isEmergency && styles.emergencyText
                                        ]}>
                                            {contact.name}
                                        </Text>
                                        {contact.isEmergency && (
                                            <View style={styles.emergencyBadge}>
                                                <Text style={styles.emergencyBadgeText}>KECEMASAN</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.contactDepartment}>{contact.department}</Text>
                                    <TouchableOpacity
                                        style={styles.phoneButton}
                                        onPress={() => handlePhoneCall(contact.phone)}
                                    >
                                        <MaterialIcons name="call" size={16} color={primaryColor} />
                                        <Text style={styles.phoneNumber}>{contact.phone}</Text>
                                    </TouchableOpacity>
                                    {contact.email && (
                                        <TouchableOpacity
                                            style={styles.emailButton}
                                            onPress={() => handleEmailPress(contact.email!)}
                                        >
                                            <MaterialIcons name="email" size={16} color={primaryColor} />
                                            <Text style={styles.emailText}>{contact.email}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: primaryColor,
        padding: 20,
        paddingTop: 60,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    section: {
        margin: 16,
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    complaintGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    complaintCard: {
        width: '48%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    complaintTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginTop: 8,
        textAlign: 'center',
    },
    complaintDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center',
    },
    complaintIncharge: {
        fontSize: 11,
        color: primaryColor,
        marginTop: 8,
        fontWeight: '500',
    },
    contactsList: {
        gap: 12,
    },
    contactCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    emergencyCard: {
        borderWidth: 2,
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    contactInfo: {
        flex: 1,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    emergencyText: {
        color: '#DC2626',
    },
    emergencyBadge: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    emergencyBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    contactDepartment: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    phoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    phoneNumber: {
        fontSize: 14,
        color: primaryColor,
        fontWeight: '500',
        marginLeft: 4,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    emailText: {
        fontSize: 13,
        color: primaryColor,
        marginLeft: 4,
    },
});