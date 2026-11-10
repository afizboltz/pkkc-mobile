import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "@/src/i18n";
import { logoutUser, resubmitApplication } from "@/src/services/auth";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from "@/src/theme";

export default function RejectedScreen() {
    const [isResubmitting, setIsResubmitting] = useState(false);
    const [newReceiptUri, setNewReceiptUri] = useState<string | null>(null);
    const { userProfile, refreshProfile } = useAuth();
    const { t } = useTranslation();

    const pickNewReceipt = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(t('permissionRequired'), t('needPhotoPermission'));
            return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!res.canceled) {
            setNewReceiptUri(res.assets[0].uri);
        }
    };

    const doResubmit = async () => {
        try {
            setIsResubmitting(true);
            const { outcome } = await resubmitApplication(newReceiptUri || undefined);
            if (outcome === 'too_soon') {
                Alert.alert(t('resubmitTooSoonTitle'), t('resubmitTooSoonMessage'));
                return;
            }
            await refreshProfile();
            Alert.alert(t('resubmitSuccessTitle'), t('resubmitSuccessMessage'));
            router.replace('/pending');
        } catch (e: any) {
            Alert.alert(t('error'), t('resubmitFailed'));
        } finally {
            setIsResubmitting(false);
        }
    };

    const handleResubmit = () => {
        Alert.alert(
            t('resubmitConfirmTitle'),
            t('resubmitConfirmMessage'),
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('resubmitForReview'), onPress: doResubmit },
            ]
        );
    };

    const handleSignOut = async () => {
        try {
            await logoutUser();
            router.replace('/login');
        } catch (e: any) {
            Alert.alert(t('signOutFailed'), e?.message || t('pleaseTryAgain'));
        }
    };

    const rejectedRemark = userProfile?.rejectedRemark?.trim();
    const rejectedOn = userProfile?.rejectedAtMillis
        ? dayjs(userProfile.rejectedAtMillis).format('DD MMM YYYY')
        : null;

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="close-circle" size={48} color={ColorPalette.error[500]} />
                    </View>
                </View>

                <View>
                    <Text style={styles.title}>{t('accountRejectedHeading')}</Text>
                </View>

                <View>
                    <Text style={styles.subtitle}>{t('rejectedIntro')}</Text>
                </View>

                <View style={{ width: '100%' }}>
                    <Card variant="outlined" padding="lg" style={styles.infoCard}>
                        <Text style={styles.reasonLabel}>{t('rejectionReasonLabel')}</Text>
                        <Text style={styles.reasonText}>
                            {rejectedRemark || t('noRejectionRemarkProvided')}
                        </Text>
                        {rejectedOn && (
                            <Text style={styles.rejectedOnText}>{t('rejectedOnLabel')}: {rejectedOn}</Text>
                        )}
                    </Card>
                </View>

                <View style={{ width: '100%' }}>
                    <Card variant="elevated" padding="md" style={styles.receiptCard}>
                        <Text style={styles.uploadLabel}>{t('updateReceiptOptional')}</Text>
                        {newReceiptUri ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: newReceiptUri }} style={styles.imagePreview} />
                                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setNewReceiptUri(null)}>
                                    <Ionicons name="close-circle" size={24} color={ColorPalette.error[500]} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.uploadButton} onPress={pickNewReceipt}>
                                <Ionicons name="cloud-upload-outline" size={28} color={ColorPalette.primary[500]} />
                                <Text style={styles.uploadText}>{t('pickScreenshot')}</Text>
                            </TouchableOpacity>
                        )}
                    </Card>
                </View>

                <View style={{ width: '100%' }}>
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={handleResubmit}
                        loading={isResubmitting}
                        style={styles.actionButton}
                    >
                        {isResubmitting ? t('resubmitting') : t('resubmitForReview')}
                    </Button>
                </View>

                <View style={{ width: '100%' }}>
                    <Button
                        variant="ghost"
                        size="md"
                        fullWidth
                        onPress={handleSignOut}
                        style={styles.actionButton}
                    >
                        {t('logout')}
                    </Button>
                </View>

                <View>
                    <View style={styles.supportContainer}>
                        <Text style={styles.supportText}>{t('needHelp')}</Text>
                        <TouchableOpacity
                            style={styles.whatsappButton}
                            onPress={() =>
                                Linking.openURL("https://wa.me/60123456789?text=" + encodeURIComponent(t('whatsappTextRejected')))
                            }
                        >
                            <Ionicons name="logo-whatsapp" size={18} color={ColorPalette.white} />
                            <Text style={styles.whatsappButtonText}>{t('contactAdmin')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
        backgroundColor: ColorPalette.error[50],
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
        marginBottom: Spacing.md,
    },
    reasonLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[700],
        marginBottom: Spacing.xs,
    },
    reasonText: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[800],
        lineHeight: 20,
    },
    rejectedOnText: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.gray[500],
        marginTop: Spacing.sm,
    },
    receiptCard: {
        marginBottom: Spacing.xl,
    },
    uploadLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        color: ColorPalette.gray[700],
        marginBottom: Spacing.md,
    },
    imagePreviewContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 160,
        borderRadius: BorderRadius.lg,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -Spacing.sm,
        right: -Spacing.sm,
    },
    uploadButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: ColorPalette.primary[300],
        borderRadius: BorderRadius.lg,
        backgroundColor: ColorPalette.primary[50],
    },
    uploadText: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.primary[500],
        marginTop: Spacing.sm,
    },
    actionButton: {
        marginBottom: Spacing.sm,
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
