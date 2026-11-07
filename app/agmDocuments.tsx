import { Card } from "@/src/components/ui/Card";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "@/src/i18n";
import { getActiveAgmEvent } from "@/src/services/agmEvents";
import { getAgmDocumentSignedUrl, listAgmDocuments } from "@/src/services/agmDocuments";
import { getMyClaimedCode } from "@/src/services/agmRegistration";
import { BorderRadius, ColorPalette, Spacing, Typography } from "@/src/theme";
import type { AgmDocumentRow } from "@/src/types/models";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

const CATEGORY_ICON: Record<string, string> = {
    agenda: "list-outline",
    financial_statement: "cash-outline",
    resolution: "document-text-outline",
    minutes: "reader-outline",
    other: "document-outline",
};

export default function AgmDocumentsScreen() {
    const { userProfile } = useAuth();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [registered, setRegistered] = useState(false);
    const [documents, setDocuments] = useState<AgmDocumentRow[]>([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const event = await getActiveAgmEvent();
                if (!event || !userProfile?.id) {
                    setRegistered(false);
                    setDocuments([]);
                    return;
                }
                const claimed = await getMyClaimedCode(event.id, userProfile.id);
                setRegistered(!!claimed);
                if (claimed) {
                    setDocuments(await listAgmDocuments(event.id));
                } else {
                    setDocuments([]);
                }
            } catch (error) {
                console.error("Error loading AGM documents:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userProfile?.id]);

    const openDocument = async (doc: AgmDocumentRow) => {
        try {
            const url = await getAgmDocumentSignedUrl(doc.file_path);
            await WebBrowser.openBrowserAsync(url);
        } catch (error: any) {
            Alert.alert(t("error"), error?.message || t("failedToLoadAttachment"));
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ColorPalette.primary[500]} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={documents}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInUp.duration(300).delay(index * 60)}>
                        <TouchableOpacity onPress={() => openDocument(item)}>
                            <Card variant="elevated" padding="md" style={styles.docCard}>
                                <View style={styles.iconWrap}>
                                    <Ionicons
                                        name={(CATEGORY_ICON[item.category] as any) || "document-outline"}
                                        size={22}
                                        color={ColorPalette.primary[500]}
                                    />
                                </View>
                                <View style={styles.docInfo}>
                                    <Text style={styles.docTitle}>{item.title}</Text>
                                    <Text style={styles.docCategory}>{item.category.replace("_", " ")}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={ColorPalette.gray[400]} />
                            </Card>
                        </TouchableOpacity>
                    </Animated.View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-outline" size={48} color={ColorPalette.gray[300]} />
                        <Text style={styles.emptyText}>
                            {registered ? t("agmDocumentsEmpty") : t("agmDocumentsEmptyNotRegistered")}
                        </Text>
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
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ColorPalette.gray[50],
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
    },
    docCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.sm,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: ColorPalette.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginRight: Spacing.md,
    },
    docInfo: {
        flex: 1,
    },
    docTitle: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[800],
    },
    docCategory: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.gray[500],
        textTransform: "capitalize",
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 100,
    },
    emptyText: {
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[400],
        marginTop: Spacing.md,
        textAlign: "center",
        paddingHorizontal: Spacing.xl,
    },
});
