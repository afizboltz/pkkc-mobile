import { Colors, primaryColor } from '@/src/constants/Colors';
import { Stack } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/src/components/ui/Card';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';

const tertiaryColor = "#e8a812";

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

const OrganizationCard: React.FC<{ member: CommitteeMember; index: number }> = ({ member, index }) => {
    const getCardStyle = () => {
        switch (member.level) {
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

    return (
        <Animated.View entering={FadeInDown.duration(400).delay(index * 50)}>
            <View style={[styles.card, getCardStyle()]}>
                <Text style={styles.position}>{member.position}</Text>
                <Text style={styles.name}>{member.name}</Text>
            </View>
        </Animated.View>
    );
};

const ConnectorLine: React.FC<{ height?: number }> = ({ height = 20 }) => {
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
                <Animated.View 
                    style={styles.headerSection}
                    entering={FadeInDown.duration(500)}
                >
                    <Text style={styles.headerTitle}>Jawatankuasa PKKC</Text>
                    <Text style={styles.headerSubtitle}>Persatuan Komuniti Kita Cybersouth</Text>
                </Animated.View>

                <View style={styles.chartContainer}>
                    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                        <View style={styles.levelContainer}>
                            <OrganizationCard member={committeeMembers[0]} index={0} />
                        </View>
                    </Animated.View>

                    <ConnectorLine />

                    <Animated.View entering={FadeInDown.duration(400).delay(150)}>
                        <View style={styles.levelContainer}>
                            <OrganizationCard member={committeeMembers[1]} index={1} />
                        </View>
                    </Animated.View>

                    <ConnectorLine />

                    <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                        <View style={styles.managementLevel}>
                            <View style={styles.managementRow}>
                                <OrganizationCard member={committeeMembers[2]} index={2} />
                            </View>
                            <View style={styles.managementRow}>
                                <OrganizationCard member={committeeMembers[3]} index={3} />
                            </View>
                            <View style={styles.managementRow}>
                                <OrganizationCard member={committeeMembers[4]} index={4} />
                            </View>
                        </View>
                    </Animated.View>

                    <ConnectorLine />

                    <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                        <View style={styles.membersLevel}>
                            <View style={styles.membersRow}>
                                <OrganizationCard member={committeeMembers[5]} index={5} />
                            </View>
                            <View style={styles.membersRow}>
                                <OrganizationCard member={committeeMembers[6]} index={6} />
                            </View>
                            <View style={styles.membersRow}>
                                <OrganizationCard member={committeeMembers[7]} index={7} />
                            </View>
                            <View style={styles.membersRow}>
                                <OrganizationCard member={committeeMembers[8]} index={8} />
                            </View>
                            <View style={styles.membersRow}>
                                <OrganizationCard member={committeeMembers[9]} index={9} />
                            </View>
                            <View style={styles.membersRow}>
                                <OrganizationCard member={committeeMembers[10]} index={10} />
                            </View>
                            <View style={styles.membersRow}>
                                <OrganizationCard member={committeeMembers[11]} index={11} />
                            </View>
                            <View style={styles.membersRow}>
                                <OrganizationCard member={committeeMembers[12]} index={12} />
                            </View>
                            <View style={styles.membersRow}>
                                <OrganizationCard member={committeeMembers[13]} index={13} />
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxxl,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    headerTitle: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.primary[600],
    },
    headerSubtitle: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[500],
        marginTop: Spacing.xs,
    },
    chartContainer: {
        alignItems: 'center',
    },
    levelContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    managementLevel: {
        width: '100%',
        marginBottom: Spacing.xs,
    },
    managementRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    membersLevel: {
        width: '100%',
    },
    membersRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    card: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
        maxWidth: 300,
        ...Shadow.md,
    },
    chairmanCard: {
        backgroundColor: ColorPalette.primary[600],
        borderWidth: 2,
        borderColor: tertiaryColor,
    },
    deputyCard: {
        backgroundColor: ColorPalette.primary[700],
        borderWidth: 1,
        borderColor: tertiaryColor,
    },
    managementCard: {
        backgroundColor: ColorPalette.primary[800],
        borderWidth: 1,
        borderColor: ColorPalette.gray[400],
    },
    memberCard: {
        backgroundColor: ColorPalette.primary[900],
        borderWidth: 1,
        borderColor: ColorPalette.gray[500],
    },
    position: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.white,
        textAlign: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.white,
        textAlign: 'center',
        opacity: 0.9,
    },
    connector: {
        width: 2,
        backgroundColor: ColorPalette.gray[300],
        marginVertical: 4,
    },
});
