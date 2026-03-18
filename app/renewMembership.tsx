import { useTranslation } from "@/src/i18n";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import { arrayUnion, doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import app, { auth } from "../src/config/firebase";
import { useAuth } from "../src/hooks/useAuth";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from "@/src/theme";

const db = getFirestore();
const storage = getStorage(app);

export default function RenewMembershipScreen() {
    const navigation = useNavigation();
    const { userProfile } = useAuth();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { t } = useTranslation();

    const emailKey = userProfile?.email!.toLowerCase().trim();
    const isAjk = (userProfile?.role || "").toLowerCase() === "ajk" || (userProfile?.role || "").toLowerCase() === "admin";
    const [selectedKind, setSelectedKind] = useState<"payment" | "certificate">("payment");

    const pickImage = async () => {
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
            setImageUri(res.assets[0].uri);
        }
    };

    const submitRenewal = async () => {
        if (!auth.currentUser) {
            Alert.alert(t('notSignedIn'));
            return;
        }
        const effectiveKind: "payment" | "certificate" = isAjk ? selectedKind : "payment";
        if (!imageUri) {
            Alert.alert(
                effectiveKind === "certificate" ? (t('pleaseUploadCertificate') || 'Please upload your certificate.') : t('pleaseUploadScreenshot')
            );
            return;
        }

        try {
            setUploading(true);
            const uid = auth.currentUser.uid;
            const response = await fetch(imageUri);
            const blob = await response.blob();

            const filename = `renewMember/${uid}/${Date.now()}.jpg`;
            const sRef = storageRef(storage, filename);
            await uploadBytes(sRef, blob, { contentType: "image/jpeg" });
            const url = await getDownloadURL(sRef);

            await setDoc(
                doc(db, "users", emailKey),
                {
                    email: emailKey,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            const renewalId = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
            await setDoc(
                doc(db, "users", emailKey),
                {
                    renewals: arrayUnion({
                        id: renewalId,
                        kind: effectiveKind,
                        amount: effectiveKind === "certificate" ? 0 : 5,
                        submittedAtMillis: Date.now(),
                        ...(effectiveKind === "certificate" ? { certificateUrl: url } : { screenshotUrl: url, paymentMethod: "bank_transfer" }),
                        status: "pending",
                    }),
                },
                { merge: true }
            );

            setUploading(false);
            Alert.alert(t('success'), t('renewalSubmitted'));
        } catch (err: any) {
            setUploading(false);
            const code = err?.code;
            const serverResponse = err?.customData?.serverResponse;
            console.error("Upload error:", code, err?.message, serverResponse);
            Alert.alert(
                t('uploadFailed'),
                `${err?.message || "Unknown error"}${code ? `\nCode: ${code}` : ""}`
            );
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInUp.duration(400)}>
                <Card variant="elevated" padding="lg">
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="refresh" size={32} color={ColorPalette.primary[500]} />
                        </View>
                        <Text style={styles.title}>{t('renewPKKC')}</Text>
                        <Text style={styles.subtitle}>Renew your membership to stay active</Text>
                    </View>

                    {isAjk ? (
                        <View style={styles.toggleContainer}>
                            <View style={styles.toggleButtons}>
                                <Button 
                                    variant={selectedKind === 'payment' ? 'primary' : 'ghost'}
                                    size="sm"
                                    onPress={() => setSelectedKind('payment')}
                                    style={styles.toggleButton}
                                >
                                    Payment
                                </Button>
                                <Button 
                                    variant={selectedKind === 'certificate' ? 'primary' : 'ghost'}
                                    size="sm"
                                    onPress={() => setSelectedKind('certificate')}
                                    style={styles.toggleButton}
                                >
                                    Certificate
                                </Button>
                            </View>
                            <Text style={styles.instructionText}>
                                {selectedKind === 'certificate' ? (t('uploadCertificateInstruction') || 'ACTIVE members: Please upload your latest program certificate (no payment required).') : t('transferInstruction')}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.instructionBox}>
                            <Ionicons name="information-circle" size={20} color={ColorPalette.info[500]} />
                            <Text style={styles.instructionText}>
                                {t('transferInstruction')}
                            </Text>
                        </View>
                    )}
                </Card>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(400).delay(100)}>
                <Card variant="elevated" padding="lg" style={styles.uploadCard}>
                    <Text style={styles.uploadLabel}>
                        {(isAjk ? (selectedKind === 'certificate') : false) ? (t('pickCertificate') || 'Pick Certificate') : t('pickScreenshot')}
                    </Text>
                    
                    {imageUri ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                            <View style={styles.imageActions}>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onPress={pickImage}
                                >
                                    <Ionicons name="camera" size={16} color={ColorPalette.primary[500]} />
                                    Change
                                </Button>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                                <Ionicons name="cloud-upload-outline" size={48} color={ColorPalette.primary[400]} />
                                <Text style={styles.uploadButtonText}>Tap to upload</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.submitContainer}>
                {uploading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={ColorPalette.primary[500]} />
                        <Text style={styles.loadingText}>Uploading...</Text>
                    </View>
                ) : (
                    <Button 
                        variant="primary" 
                        size="lg" 
                        fullWidth 
                        onPress={submitRenewal}
                        disabled={!imageUri}
                    >
                        <Ionicons name="checkmark-circle" size={20} color={ColorPalette.white} />
                        {t('submit')}
                    </Button>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.md,
        backgroundColor: ColorPalette.gray[50],
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        backgroundColor: ColorPalette.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[500],
        textAlign: 'center',
    },
    toggleContainer: {
        marginTop: Spacing.md,
    },
    toggleButtons: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    toggleButton: {
        flex: 1,
    },
    instructionBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: ColorPalette.info[50],
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    instructionText: {
        flex: 1,
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[600],
        lineHeight: 20,
    },
    uploadCard: {
        marginTop: Spacing.md,
    },
    uploadLabel: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[800],
        marginBottom: Spacing.md,
    },
    imagePreviewContainer: {
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: BorderRadius.lg,
    },
    imageActions: {
        marginTop: Spacing.sm,
    },
    uploadPlaceholder: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    uploadButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: ColorPalette.primary[300],
        borderRadius: BorderRadius.lg,
        backgroundColor: ColorPalette.primary[50],
        width: '100%',
    },
    uploadButtonText: {
        marginTop: Spacing.sm,
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.primary[400],
    },
    submitContainer: {
        marginTop: Spacing.xl,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[500],
    },
});
