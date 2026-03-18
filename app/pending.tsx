import { db } from "@/src/config/firebase";
import { useTranslation } from "@/src/i18n";
import { mmkvAsyncStorage } from "@/src/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from "@/src/theme";

export default function PendingScreen() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();

    const handleCheckStatus = async () => {
        try {
            setIsRefreshing(true);
            const storedEmail = await mmkvAsyncStorage.getItem("signupEmail");
            const email = storedEmail?.trim().toLowerCase();

            if (!email) {
                Alert.alert(t('noEmailFound'), t('pleaseSignupAgain'));
                return;
            }

            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email), limit(1));
            const snap = await getDocs(q);

            if (snap.empty) {
                Alert.alert(t('notFound'), t('registrationNotFound'));
                return;
            }

            const userDoc = snap.docs[0];
            const data = userDoc.data() as { status?: string };
            const status = (data.status || "").toLowerCase();

            if (status === "active") {
                await mmkvAsyncStorage.removeItem('signupEmail');
                router.replace("/dashboard");
                return;
            }

            Alert.alert(
                t('stillPending'),
                t('pendingAdvise')
            );
        } catch (e: any) {
            Alert.alert(t('error'), e?.message || t('failedToCheckStatus'));
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View 
                style={styles.contentContainer}
                entering={FadeIn.duration(600)}
            >
                <Animated.View 
                    style={styles.iconContainer}
                    entering={FadeInUp.duration(500).delay(100)}
                >
                    <View style={styles.iconCircle}>
                        <Ionicons name="time" size={48} color={ColorPalette.warning[500]} />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(500).delay(200)}>
                    <Text style={styles.title}>{t('accountPendingApproval')}</Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(500).delay(300)}>
                    <Text style={styles.subtitle}>
                        {t('pendingThankYou')}
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(500).delay(400)}>
                    <Card variant="outlined" padding="lg" style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="checkmark-circle" size={20} color={ColorPalette.success[500]} />
                            <Text style={styles.infoText}>Registration submitted successfully</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="people" size={20} color={ColorPalette.info[500]} />
                            <Text style={styles.infoText}>Waiting for admin approval</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="notifications" size={20} color={ColorPalette.warning[500]} />
                            <Text style={styles.infoText}>You'll be notified once approved</Text>
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(500).delay(500)}>
                    <Button 
                        variant="primary" 
                        size="lg" 
                        fullWidth 
                        onPress={handleCheckStatus}
                        loading={isRefreshing}
                        style={styles.checkButton}
                    >
                        <Ionicons name="refresh" size={20} color={ColorPalette.white} />
                        {isRefreshing ? t('checking') : t('checkStatus')}
                    </Button>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(500).delay(600)}>
                    <View style={styles.supportContainer}>
                        <Text style={styles.supportText}>{t('needHelp')}</Text>
                        <TouchableOpacity
                            style={styles.whatsappButton}
                            onPress={() =>
                                Linking.openURL("https://wa.me/60123456789?text=" + encodeURIComponent(t('whatsappText')))
                            }
                        >
                            <Ionicons name="logo-whatsapp" size={18} color={ColorPalette.white} />
                            <Text style={styles.whatsappButtonText}>{t('contactAdmin')}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.lg,
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: Spacing.xl,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: ColorPalette.warning[50],
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.lg,
    },
    title: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
        marginBottom: Spacing.sm,
        textAlign: "center",
    },
    subtitle: {
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[500],
        textAlign: "center",
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    infoCard: {
        width: '100%',
        marginBottom: Spacing.xl,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[700],
    },
    checkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    supportContainer: {
        marginTop: Spacing.xl,
        alignItems: "center",
    },
    supportText: {
        color: ColorPalette.gray[500],
        fontSize: Typography.fontSize.sm,
        marginBottom: Spacing.sm,
    },
    whatsappButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: ColorPalette.success[500],
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
    },
    whatsappButtonText: {
        color: ColorPalette.white,
        fontWeight: Typography.fontWeight.semibold,
    },
});
