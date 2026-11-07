import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "@/src/i18n";
import { getActiveAgmEvent } from "@/src/services/agmEvents";
import { getMyClaimedCode } from "@/src/services/agmRegistration";
import { ColorPalette, Shadow, Spacing, Typography } from "@/src/theme";
import type { AgmCodeRow, AgmEventRow } from "@/src/types/models";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function AgmHubScreen() {
    const { userProfile } = useAuth();
    const { t } = useTranslation();
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<AgmEventRow | null>(null);
    const [claimedCode, setClaimedCode] = useState<AgmCodeRow | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const activeEvent = await getActiveAgmEvent();
            setEvent(activeEvent);
            if (activeEvent && userProfile?.id) {
                setClaimedCode(await getMyClaimedCode(activeEvent.id, userProfile.id));
            } else {
                setClaimedCode(null);
            }
        } catch (error) {
            console.error("Error loading AGM hub:", error);
        } finally {
            setLoading(false);
        }
    }, [userProfile?.id]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ColorPalette.primary[500]} />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="calendar-outline" size={48} color={ColorPalette.gray[300]} />
                <Text style={styles.emptyText}>{t("agmNoActiveEvent")}</Text>
            </View>
        );
    }

    const registered = !!claimedCode;

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInUp.duration(400)}>
                <Card variant="elevated" padding="lg" style={styles.headerCard}>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventDate}>{dayjs(event.event_date).format("D MMMM YYYY")}</Text>
                </Card>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(400).delay(100)}>
                <Card
                    variant="outlined"
                    padding="lg"
                    style={[styles.statusCard, registered ? styles.statusCardOk : styles.statusCardWarn]}
                >
                    <Ionicons
                        name={registered ? "checkmark-circle" : "alert-circle-outline"}
                        size={32}
                        color={registered ? ColorPalette.success[500] : ColorPalette.warning[500]}
                    />
                    <Text style={styles.statusTitle}>
                        {registered ? t("agmRegisteredTitle") : t("agmNotRegisteredTitle")}
                    </Text>
                    <Text style={styles.statusMessage}>
                        {registered ? `${t("agmRegisteredMessage")}${claimedCode?.code}` : t("agmNotRegisteredMessage")}
                    </Text>
                </Card>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.actions}>
                {!registered ? (
                    <Button variant="primary" size="lg" fullWidth onPress={() => navigation.navigate("agmRegister" as never)}>
                        {t("agmRegisterNow")}
                    </Button>
                ) : (
                    <>
                        <Button variant="secondary" size="lg" fullWidth onPress={() => navigation.navigate("agmDocuments" as never)}>
                            {t("agmViewDocuments")}
                        </Button>
                        <Button variant="primary" size="lg" fullWidth onPress={() => navigation.navigate("agmVoting" as never)} style={styles.spacedButton}>
                            {t("agmGoToVoting")}
                        </Button>
                    </>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
        padding: Spacing.md,
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
    headerCard: {
        marginBottom: Spacing.md,
        alignItems: "center",
    },
    eventName: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
    },
    eventDate: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[500],
        marginTop: Spacing.xs,
    },
    statusCard: {
        alignItems: "center",
        marginBottom: Spacing.lg,
        ...Shadow.sm,
    },
    statusCardOk: {
        borderColor: ColorPalette.success[200],
        backgroundColor: ColorPalette.success[50],
    },
    statusCardWarn: {
        borderColor: ColorPalette.warning[200],
        backgroundColor: ColorPalette.warning[50],
    },
    statusTitle: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[800],
        marginTop: Spacing.sm,
    },
    statusMessage: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[600],
        textAlign: "center",
        marginTop: Spacing.xs,
    },
    actions: {
        gap: Spacing.sm,
    },
    spacedButton: {
        marginTop: Spacing.sm,
    },
});
