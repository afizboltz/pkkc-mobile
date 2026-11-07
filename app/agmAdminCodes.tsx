import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { isStaffRole, NotAuthorized } from "@/src/components/NotAuthorized";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "@/src/i18n";
import { generateAgmCodes, listAgmCodes } from "@/src/services/agmCodes";
import { getActiveAgmEvent } from "@/src/services/agmEvents";
import { escapeHtml } from "@/src/utils/escapeHtml";
import { BorderRadius, ColorPalette, Spacing, Typography } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, View } from "react-native";

type CodeListItem = {
    id: string;
    code: string;
    status: "unused" | "claimed";
    claimedByName: string | null;
};

export default function AgmAdminCodesScreen() {
    const { userProfile } = useAuth();
    const { t } = useTranslation();

    const [eventId, setEventId] = useState<string | null>(null);
    const [codes, setCodes] = useState<CodeListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState("50");
    const [generating, setGenerating] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const event = await getActiveAgmEvent();
            setEventId(event?.id ?? null);
            if (event) setCodes(await listAgmCodes(event.id));
        } catch (error) {
            console.error("Error loading AGM codes:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const onGenerate = async () => {
        const n = parseInt(count, 10);
        if (!eventId || !n || n <= 0) return;
        setGenerating(true);
        try {
            await generateAgmCodes(eventId, n);
            await load();
        } catch (error: any) {
            Alert.alert(t("error"), error?.message || t("agmErrorUnknown"));
        } finally {
            setGenerating(false);
        }
    };

    const onExportPdf = async () => {
        if (codes.length === 0) return;
        const cells = codes
            .map((c) => `<div style="border:1px solid #999;border-radius:8px;padding:12px;margin:4px;width:28%;text-align:center;font-size:20px;font-weight:bold;letter-spacing:2px;">${escapeHtml(c.code)}</div>`)
            .join("");
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body style="font-family:-apple-system,sans-serif;">
            <h2 style="text-align:center;">AGM Badge Codes</h2>
            <div style="display:flex;flex-wrap:wrap;">${cells}</div>
        </body></html>`;
        try {
            const file = await Print.printToFileAsync({ html });
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, { mimeType: "application/pdf", dialogTitle: "AGM Badge Codes" });
            } else {
                Alert.alert("Saved", file.uri);
            }
        } catch (error: any) {
            Alert.alert(t("error"), error?.message || t("agmErrorUnknown"));
        }
    };

    if (!isStaffRole(userProfile?.role)) {
        return <NotAuthorized />;
    }

    return (
        <View style={styles.container}>
            <Card variant="elevated" padding="lg" style={styles.generateCard}>
                <Text style={styles.label}>{t("agmGenerateCodesCount")}</Text>
                <View style={styles.generateRow}>
                    <TextInput
                        value={count}
                        onChangeText={(v) => setCount(v.replace(/[^0-9]/g, ""))}
                        keyboardType="number-pad"
                        style={styles.countInput}
                    />
                    <Button variant="primary" loading={generating} disabled={!eventId || generating} onPress={onGenerate}>
                        {t("agmGenerateButton")}
                    </Button>
                </View>
                <Button variant="secondary" fullWidth onPress={onExportPdf} disabled={codes.length === 0} style={styles.exportButton}>
                    <Ionicons name="download-outline" size={16} color={ColorPalette.gray[700]} /> {t("agmExportPdfButton")}
                </Button>
            </Card>

            {loading ? (
                <ActivityIndicator size="large" color={ColorPalette.primary[500]} style={styles.spinner} />
            ) : (
                <FlatList
                    data={codes}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.codeRow}>
                            <Text style={styles.codeText}>{item.code}</Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    item.status === "claimed" ? styles.statusClaimed : styles.statusUnused,
                                ]}
                            >
                                <Text style={styles.statusText}>
                                    {item.status === "claimed" ? t("agmCodeStatusClaimed") : t("agmCodeStatusUnused")}
                                </Text>
                            </View>
                            {item.claimedByName ? <Text style={styles.claimant}>{item.claimedByName}</Text> : null}
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
        padding: Spacing.md,
    },
    generateCard: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[600],
        marginBottom: Spacing.xs,
    },
    generateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    countInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: ColorPalette.gray[200],
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[900],
    },
    exportButton: {
        marginTop: Spacing.md,
    },
    spinner: {
        marginTop: Spacing.xl,
    },
    listContent: {
        paddingBottom: Spacing.xxl,
    },
    codeRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: ColorPalette.white,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xs,
        gap: Spacing.sm,
    },
    codeText: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
        letterSpacing: 2,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    statusUnused: {
        backgroundColor: ColorPalette.gray[100],
    },
    statusClaimed: {
        backgroundColor: ColorPalette.success[100],
    },
    statusText: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.gray[700],
    },
    claimant: {
        flex: 1,
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[500],
        textAlign: "right",
    },
});
