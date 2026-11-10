import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "@/src/i18n";
import { getActiveAgmEvent } from "@/src/services/agmEvents";
import { getResolutionTally, listAgmResolutions } from "@/src/services/agmResolutions";
import { castVote, getMyVote } from "@/src/services/agmVotes";
import type { AgmVoteChoice } from "@/src/services/agmVotes";
import { ColorPalette, Spacing, Typography } from "@/src/theme";
import type { AgmResolutionRow, AgmResolutionTally, AgmVoteRow } from "@/src/types/models";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

const POLL_MS = 4000;

export default function AgmVotingScreen() {
    const { userProfile } = useAuth();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [resolution, setResolution] = useState<AgmResolutionRow | null>(null);
    const [myVote, setMyVote] = useState<AgmVoteRow | null>(null);
    const [tally, setTally] = useState<AgmResolutionTally | null>(null);
    const [voting, setVoting] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isActiveRef = useRef(false);

    const load = useCallback(async (showSpinner: boolean) => {
        if (showSpinner) setLoading(true);
        try {
            const event = await getActiveAgmEvent();
            if (!isActiveRef.current) return;
            if (!event) {
                setResolution(null);
                return;
            }
            const resolutions = await listAgmResolutions(event.id);
            if (!isActiveRef.current) return;
            const open = resolutions.find((r) => r.status === "open");
            const latestClosed = resolutions
                .filter((r) => r.status === "closed")
                .sort((a, b) => (b.closed_at || "").localeCompare(a.closed_at || ""))[0];
            const current = open ?? latestClosed ?? null;
            setResolution(current);

            if (current && userProfile?.id) {
                const [vote, resultTally] = await Promise.all([
                    getMyVote(current.id, userProfile.id),
                    getResolutionTally(current.id),
                ]);
                if (!isActiveRef.current) return;
                setMyVote(vote);
                setTally(resultTally);
            } else {
                setMyVote(null);
                setTally(null);
            }
        } catch (error) {
            console.error("Error loading AGM voting:", error);
        } finally {
            if (showSpinner && isActiveRef.current) setLoading(false);
        }
    }, [userProfile?.id]);

    useFocusEffect(
        useCallback(() => {
            isActiveRef.current = true;
            load(true);
            timerRef.current = setInterval(() => load(false), POLL_MS);
            return () => {
                isActiveRef.current = false;
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }, [load])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await load(false);
        setRefreshing(false);
    };

    const onVote = (choice: AgmVoteChoice) => {
        if (!resolution || !userProfile?.id) return;
        Alert.alert(t("agmVoteConfirmTitle"), t("agmVoteConfirmMessage"), [
            { text: t("cancel"), style: "cancel" },
            {
                text: t("ok"),
                onPress: async () => {
                    setVoting(true);
                    try {
                        await castVote({ resolutionId: resolution.id, userId: userProfile.id, choice });
                        setMyVote({
                            id: "local",
                            resolution_id: resolution.id,
                            user_id: userProfile.id,
                            choice,
                            cast_at: new Date().toISOString(),
                        });
                    } catch (error: any) {
                        const duplicate = error?.code === "23505"; // unique_violation on (resolution_id, user_id)
                        Alert.alert(t("error"), duplicate ? t("agmVoteAlreadyCast") : error?.message || t("agmErrorUnknown"));
                        if (duplicate) await load(false);
                    } finally {
                        setVoting(false);
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ColorPalette.primary[500]} />
            </View>
        );
    }

    if (!resolution) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="hourglass-outline" size={48} color={ColorPalette.gray[300]} />
                <Text style={styles.emptyText}>{t("agmVotingNoneOpen")}</Text>
            </View>
        );
    }

    const isOpen = resolution.status === "open";
    const showTally = !isOpen || !!myVote;
    const tallyVisible = tally?.visible ?? false;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Card variant="elevated" padding="lg">
                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, isOpen ? styles.statusDotOpen : styles.statusDotClosed]} />
                    <Text style={styles.statusLabel}>{isOpen ? t("agmOpen") : t("agmClosed")}</Text>
                </View>
                <Text style={styles.resolutionTitle}>{resolution.title}</Text>
                {resolution.description ? <Text style={styles.resolutionDesc}>{resolution.description}</Text> : null}
            </Card>

            {isOpen && !myVote ? (
                <View style={styles.voteButtons}>
                    <Button variant="success" size="lg" fullWidth loading={voting} disabled={voting} onPress={() => onVote("yes")}>
                        {t("agmVoteYes")}
                    </Button>
                    <Button variant="error" size="lg" fullWidth loading={voting} disabled={voting} onPress={() => onVote("no")} style={styles.spacedButton}>
                        {t("agmVoteNo")}
                    </Button>
                    <Button variant="ghost" size="lg" fullWidth loading={voting} disabled={voting} onPress={() => onVote("abstain")} style={styles.spacedButton}>
                        {t("agmVoteAbstain")}
                    </Button>
                </View>
            ) : null}

            {isOpen && myVote ? (
                <Card variant="outlined" padding="md" style={styles.votedCard}>
                    <Ionicons name="checkmark-circle" size={22} color={ColorPalette.success[500]} />
                    <Text style={styles.votedText}>{t("agmVoteSubmitted")}</Text>
                </Card>
            ) : null}

            {showTally && tallyVisible && tally ? (
                <Card variant="elevated" padding="lg" style={styles.tallyCard}>
                    <Text style={styles.tallyTitle}>{t("agmResultsTitle")}</Text>
                    <TallyRow label={t("agmTallyYes")} count={tally.yes_count} color={ColorPalette.success[500]} />
                    <TallyRow label={t("agmTallyNo")} count={tally.no_count} color={ColorPalette.error[500]} />
                    <TallyRow label={t("agmTallyAbstain")} count={tally.abstain_count} color={ColorPalette.gray[400]} />
                    <View style={styles.tallyDivider} />
                    <TallyRow label={t("agmTallyTotal")} count={tally.total} color={ColorPalette.gray[700]} bold />
                </Card>
            ) : null}
        </ScrollView>
    );
}

function TallyRow({ label, count, color, bold }: { label: string; count: number; color: string; bold?: boolean }) {
    return (
        <View style={styles.tallyRow}>
            <View style={[styles.tallyDot, { backgroundColor: color }]} />
            <Text style={[styles.tallyLabel, bold && styles.tallyLabelBold]}>{label}</Text>
            <Text style={[styles.tallyCount, bold && styles.tallyLabelBold]}>{count}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
    },
    content: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ColorPalette.gray[50],
        padding: Spacing.xl,
    },
    emptyText: {
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[500],
        marginTop: Spacing.md,
        textAlign: "center",
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.sm,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Spacing.xs,
    },
    statusDotOpen: {
        backgroundColor: ColorPalette.success[500],
    },
    statusDotClosed: {
        backgroundColor: ColorPalette.gray[400],
    },
    statusLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[600],
        textTransform: "uppercase",
    },
    resolutionTitle: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
    },
    resolutionDesc: {
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[600],
        marginTop: Spacing.sm,
    },
    voteButtons: {
        marginTop: Spacing.lg,
    },
    spacedButton: {
        marginTop: Spacing.sm,
    },
    votedCard: {
        marginTop: Spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    votedText: {
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[700],
    },
    tallyCard: {
        marginTop: Spacing.lg,
    },
    tallyTitle: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
        marginBottom: Spacing.md,
    },
    tallyRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.xs,
    },
    tallyDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: Spacing.sm,
    },
    tallyLabel: {
        flex: 1,
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[700],
    },
    tallyLabelBold: {
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
    },
    tallyCount: {
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[700],
    },
    tallyDivider: {
        height: 1,
        backgroundColor: ColorPalette.gray[200],
        marginVertical: Spacing.xs,
    },
});
