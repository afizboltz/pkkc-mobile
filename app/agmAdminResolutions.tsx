import { KeyboardDismissView } from "@/src/components/KeyboardDismissView";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { isStaffRole, NotAuthorized } from "@/src/components/NotAuthorized";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "@/src/i18n";
import { getActiveAgmEvent } from "@/src/services/agmEvents";
import {
    closeResolution,
    createAgmResolution,
    getResolutionTally,
    listAgmResolutions,
    openResolution,
} from "@/src/services/agmResolutions";
import { BorderRadius, ColorPalette, Spacing, Typography } from "@/src/theme";
import type { AgmResolutionRow, AgmResolutionTally } from "@/src/types/models";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, View } from "react-native";

const POLL_MS = 3000;

export default function AgmAdminResolutionsScreen() {
    const { userProfile } = useAuth();
    const { t } = useTranslation();

    const [eventId, setEventId] = useState<string | null>(null);
    const [resolutions, setResolutions] = useState<AgmResolutionRow[]>([]);
    const [tallies, setTallies] = useState<Record<string, AgmResolutionTally>>({});
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isActiveRef = useRef(false);

    const load = useCallback(async (showSpinner: boolean) => {
        if (showSpinner) setLoading(true);
        try {
            const event = await getActiveAgmEvent();
            if (!isActiveRef.current) return;
            setEventId(event?.id ?? null);
            if (!event) return;
            const list = await listAgmResolutions(event.id);
            if (!isActiveRef.current) return;
            setResolutions(list);

            const relevant = list.filter((r) => r.status === "open" || r.status === "closed");
            const entries = await Promise.all(relevant.map(async (r) => [r.id, await getResolutionTally(r.id)] as const));
            if (!isActiveRef.current) return;
            setTallies(Object.fromEntries(entries));
        } catch (error) {
            console.error("Error loading AGM resolutions:", error);
        } finally {
            if (showSpinner && isActiveRef.current) setLoading(false);
        }
    }, []);

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

    const onAdd = async () => {
        if (!eventId || !title.trim()) return;
        const nextSeq = (resolutions[resolutions.length - 1]?.sequence_no ?? 0) + 1;
        try {
            await createAgmResolution({ eventId, sequenceNo: nextSeq, title: title.trim(), description: description.trim() || undefined });
            setTitle("");
            setDescription("");
            await load(false);
        } catch (error: any) {
            Alert.alert(t("error"), error?.message || t("agmErrorUnknown"));
        }
    };

    const onOpen = async (id: string) => {
        setBusyId(id);
        try {
            await openResolution(id);
            await load(false);
        } catch (error: any) {
            Alert.alert(t("error"), error?.message || t("agmErrorUnknown"));
        } finally {
            setBusyId(null);
        }
    };

    const onClose = async (id: string) => {
        setBusyId(id);
        try {
            await closeResolution(id);
            await load(false);
        } catch (error: any) {
            Alert.alert(t("error"), error?.message || t("agmErrorUnknown"));
        } finally {
            setBusyId(null);
        }
    };

    if (!isStaffRole(userProfile?.role)) {
        return <NotAuthorized />;
    }

    const anyOpen = resolutions.some((r) => r.status === "open");

    return (
        <KeyboardDismissView style={styles.container}>
            <Card variant="elevated" padding="lg" style={styles.addCard}>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t("agmResolutionTitleLabel")}
                    placeholderTextColor={ColorPalette.gray[400]}
                    style={styles.input}
                />
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t("agmResolutionDescLabel")}
                    placeholderTextColor={ColorPalette.gray[400]}
                    multiline
                    style={[styles.input, styles.textArea]}
                />
                <Button variant="primary" fullWidth disabled={!eventId || !title.trim()} onPress={onAdd}>
                    {t("agmAddButton")}
                </Button>
            </Card>

            {loading ? (
                <ActivityIndicator size="large" color={ColorPalette.primary[500]} style={styles.spinner} />
            ) : (
                <FlatList
                    data={resolutions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => {
                        const tally = tallies[item.id];
                        return (
                            <Card variant="elevated" padding="md" style={styles.resCard}>
                                <View style={styles.resHeader}>
                                    <Text style={styles.resSeq}>#{item.sequence_no}</Text>
                                    <Text style={styles.resTitle}>{item.title}</Text>
                                </View>
                                <Text style={styles.resStatus}>
                                    {item.status === "open" ? t("agmOpen") : item.status === "closed" ? t("agmClosed") : t("agmPending")}
                                </Text>

                                {tally ? (
                                    <View style={styles.tallyRow}>
                                        <Text style={styles.tallyText}>Y:{tally.yes_count}</Text>
                                        <Text style={styles.tallyText}>N:{tally.no_count}</Text>
                                        <Text style={styles.tallyText}>A:{tally.abstain_count}</Text>
                                        <Text style={styles.tallyText}>Σ:{tally.total}</Text>
                                    </View>
                                ) : null}

                                <View style={styles.actionsRow}>
                                    {item.status === "pending" ? (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            loading={busyId === item.id}
                                            disabled={anyOpen || busyId === item.id}
                                            onPress={() => onOpen(item.id)}
                                        >
                                            {t("agmOpenButton")}
                                        </Button>
                                    ) : null}
                                    {item.status === "open" ? (
                                        <Button variant="error" size="sm" loading={busyId === item.id} disabled={busyId === item.id} onPress={() => onClose(item.id)}>
                                            {t("agmCloseButton")}
                                        </Button>
                                    ) : null}
                                </View>
                            </Card>
                        );
                    }}
                />
            )}
        </KeyboardDismissView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
        padding: Spacing.md,
    },
    addCard: {
        marginBottom: Spacing.md,
    },
    input: {
        borderWidth: 1,
        borderColor: ColorPalette.gray[200],
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[900],
        marginBottom: Spacing.sm,
    },
    textArea: {
        minHeight: 60,
        textAlignVertical: "top",
    },
    spinner: {
        marginTop: Spacing.xl,
    },
    listContent: {
        paddingBottom: Spacing.xxl,
    },
    resCard: {
        marginBottom: Spacing.sm,
    },
    resHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    resSeq: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[400],
    },
    resTitle: {
        flex: 1,
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[900],
    },
    resStatus: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.gray[500],
        marginTop: Spacing.xs,
        textTransform: "uppercase",
    },
    tallyRow: {
        flexDirection: "row",
        gap: Spacing.md,
        marginTop: Spacing.sm,
    },
    tallyText: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[700],
        fontWeight: Typography.fontWeight.medium,
    },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: Spacing.sm,
    },
});
