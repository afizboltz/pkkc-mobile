import { Card } from "@/src/components/ui/Card";
import { isStaffRole, NotAuthorized } from "@/src/components/NotAuthorized";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "@/src/i18n";
import { getQuorumCount } from "@/src/services/agmCodes";
import { getActiveAgmEvent } from "@/src/services/agmEvents";
import { ColorPalette, Spacing, Typography } from "@/src/theme";
import type { AgmEventRow } from "@/src/types/models";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function AgmAdminScreen() {
    const { userProfile } = useAuth();
    const { t } = useTranslation();
    const navigation = useNavigation();

    const [event, setEvent] = useState<AgmEventRow | null>(null);
    const [quorum, setQuorum] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const activeEvent = await getActiveAgmEvent();
                setEvent(activeEvent);
                if (activeEvent) setQuorum(await getQuorumCount(activeEvent.id));
            };
            load().catch((error) => console.error("Error loading AGM admin:", error));
        }, [])
    );

    if (!isStaffRole(userProfile?.role)) {
        return <NotAuthorized />;
    }

    const items = [
        { title: t("agmGenerateCodesTitle"), icon: "key-outline", route: "agmAdminCodes" },
        { title: t("agmUploadDocumentTitle"), icon: "document-outline", route: "agmAdminDocuments" },
        { title: t("agmAddResolutionTitle"), icon: "checkbox-outline", route: "agmAdminResolutions" },
    ] as const;

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInUp.duration(400)}>
                <Card variant="elevated" padding="lg" style={styles.quorumCard}>
                    <Text style={styles.quorumLabel}>{t("agmQuorumLabel")}</Text>
                    <Text style={styles.quorumValue}>{quorum}</Text>
                    <Text style={styles.eventName}>{event?.name || "-"}</Text>
                </Card>
            </Animated.View>

            {items.map((item, index) => (
                <Animated.View key={item.route} entering={FadeInUp.duration(400).delay((index + 1) * 100)}>
                    <TouchableOpacity onPress={() => navigation.navigate(item.route as never)}>
                        <Card variant="elevated" padding="md" style={styles.itemCard}>
                            <Ionicons name={item.icon as any} size={22} color={ColorPalette.primary[500]} />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Ionicons name="chevron-forward" size={18} color={ColorPalette.gray[400]} />
                        </Card>
                    </TouchableOpacity>
                </Animated.View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
        padding: Spacing.md,
    },
    quorumCard: {
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    quorumLabel: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[500],
    },
    quorumValue: {
        fontSize: Typography.fontSize.huge,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.primary[500],
    },
    eventName: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[500],
        marginTop: Spacing.xs,
    },
    itemCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        marginBottom: Spacing.sm,
    },
    itemTitle: {
        flex: 1,
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[800],
    },
});
