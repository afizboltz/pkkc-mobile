import { Colors, primaryColor, thirdaryColor } from '@/src/constants/Colors';
import { Stack } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CommitteeMember {
    id: number;
    name: string;
    position: string;
    level: number;
}

const committeeMembers: CommitteeMember[] = [
    { id: 1, name: 'ASMEL SUFIAN BIN HASSAN', position: 'Pengerusi PKKC', level: 1 },
    { id: 2, name: 'ABDUL HADI BIN OSMAN', position: 'Timbalan Pengerusi PKKC', level: 2 },
    { id: 3, name: 'Puan Syuhaidah', position: 'Setiausaha PKKC', level: 3 },
    { id: 4, name: 'NORMALA BINTI CHE EEMBI @ JAMIL', position: 'Penolong Setiausaha PKKC', level: 3 },
    { id: 5, name: 'MOHD HAFIZZUDDIN BIN KAMARUZAINI', position: 'Bendahari PKKC', level: 3 },
    { id: 6, name: 'ABDUL KARIM BIN ABDUL RAHIM', position: 'AJK PKKC', level: 4 },
    { id: 7, name: 'MUHAMMAD HARITH BIN ZAMSAIMI', position: 'AJK PKKC', level: 4 },
    { id: 8, name: 'MUHAMMAD AZHARUDDIN BIN KASWANDI', position: 'AJK PKKC', level: 4 },
    { id: 9, name: 'NIK KHAIRUL HAKIM BIN AB RAZAK', position: 'AJK PKKC', level: 4 },
    { id: 10, name: 'KHAIRUN NIZAM BIN ABD SAMAD', position: 'AJK PKKC', level: 4 },
    { id: 11, name: 'ZAKIR BIN HJ MOKRI', position: 'AJK PKKC', level: 4 },
    { id: 12, name: 'MOHD YUNUS BIN MAT NAWAWI', position: 'AJK PKKC', level: 4 },
    { id: 13, name: 'ABU HANIFAH BIN YAHAYA', position: 'AJK PKKC', level: 4 },
    { id: 14, name: 'ABDUL RAHMAN BIN MUSTAPHA', position: 'AJK PKKC', level: 4 },
];

const OrganizationCard: React.FC<{ member: CommitteeMember }> = ({ member }) => {
    return (
        <View style={[styles.card, getCardStyle(member.level)]}>
            <Text style={styles.position}>{member.position}</Text>
            <Text style={styles.name}>{member.name}</Text>
        </View>
    );
};

const getCardStyle = (level: number) => {
    switch (level) {
        case 1:
            return styles.chairmanCard;
        case 2:
            return styles.deputyCard;
        case 3:
            return styles.managementCard;
        case 4:
            return styles.memberCard;
        default:
            return styles.memberCard;
    }
};

const ConnectorLine: React.FC<{ height?: number }> = ({ height = 30 }) => {
    return <View style={[styles.connector, { height }]} />;
};

export default function OrganisationScreen() {
    const screenWidth = Dimensions.get('window').width;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Organisasi PKKC' }} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.chartContainer}>
                    {/* Chairman */}
                    <View style={styles.levelContainer}>
                        <OrganizationCard member={committeeMembers[0]} />
                    </View>

                    <ConnectorLine />

                    {/* Deputy Chairman */}
                    <View style={styles.levelContainer}>
                        <OrganizationCard member={committeeMembers[1]} />
                    </View>

                    <ConnectorLine />

                    {/* Management Level (Secretary, Assistant Secretary, Treasurer) */}
                    <View style={styles.managementLevel}>
                        <View style={styles.managementRow}>
                            <OrganizationCard member={committeeMembers[2]} />
                        </View>
                        <View style={styles.managementRow}>
                            <OrganizationCard member={committeeMembers[3]} />
                        </View>
                        <View style={styles.managementRow}>
                            <OrganizationCard member={committeeMembers[4]} />
                        </View>
                    </View>

                    <ConnectorLine />

                    {/* Committee Members */}
                    <View style={styles.membersLevel}>
                        <View style={styles.membersRow}>
                            <OrganizationCard member={committeeMembers[5]} />
                        </View>
                        <View style={styles.membersRow}>
                            <OrganizationCard member={committeeMembers[6]} />
                        </View>
                        <View style={styles.membersRow}>
                            <OrganizationCard member={committeeMembers[7]} />
                        </View>
                        <View style={styles.membersRow}>
                            <OrganizationCard member={committeeMembers[8]} />
                        </View>
                        <View style={styles.membersRow}>
                            <OrganizationCard member={committeeMembers[9]} />
                        </View>
                        <View style={styles.membersRow}>
                            <OrganizationCard member={committeeMembers[10]} />
                        </View>
                        <View style={styles.membersRow}>
                            <OrganizationCard member={committeeMembers[11]} />
                        </View>
                        <View style={styles.membersRow}>
                            <OrganizationCard member={committeeMembers[12]} />
                        </View>
                        <View style={styles.membersRow}>
                            <OrganizationCard member={committeeMembers[13]} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    chartContainer: {
        alignItems: 'center',
    },
    levelContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    managementLevel: {
        width: '100%',
        marginBottom: 10,
    },
    managementRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    membersLevel: {
        width: '100%',
    },
    membersRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    card: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
        maxWidth: 280,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    chairmanCard: {
        backgroundColor: primaryColor,
        borderWidth: 2,
        borderColor: thirdaryColor,
    },
    deputyCard: {
        backgroundColor: '#1a2f5a',
        borderWidth: 1,
        borderColor: thirdaryColor,
    },
    managementCard: {
        backgroundColor: '#2a4f7a',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    memberCard: {
        backgroundColor: '#3a6f9a',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    position: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
    },
    name: {
        fontSize: 12,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
    },
    connector: {
        width: 2,
        backgroundColor: '#ccc',
        marginVertical: 5,
    },
});