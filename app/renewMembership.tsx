import { useTranslation } from "@/src/i18n";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import { arrayUnion, doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, Image, Text, View } from "react-native";
import app, { auth } from "../src/config/firebase";
import { useAuth } from "../src/hooks/useAuth";

const db = getFirestore();
const storage = getStorage(app);

export default function RenewMembershipScreen() {
    const navigation = useNavigation();
    const { userProfile } = useAuth();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { t } = useTranslation();

    const emailKey = userProfile?.email!.toLowerCase().trim();
    const isAjk = (userProfile?.role || "").toLowerCase() === "ajk";
    const [selectedKind, setSelectedKind] = useState<"payment" | "certificate">("payment");

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(t('permissionRequired'), t('needPhotoPermission'));
            return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
            // Fallback to deprecated API to match current installed types
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
            // fetch file bytes
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // create storage path
            const filename = `renewMember/${uid}/${Date.now()}.jpg`;
            const sRef = storageRef(storage, filename);
            await uploadBytes(sRef, blob, { contentType: "image/jpeg" });
            const url = await getDownloadURL(sRef);

            // ensure user doc exists (no overwrite) – keep array fields out to avoid serverTimestamp inside arrays
            await setDoc(
                doc(db, "users", emailKey),
                {
                    email: emailKey,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            // add renewal as an array item using arrayUnion; use client timestamp to avoid serverTimestamp inside arrays
            const renewalId = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
            const effectiveKind: "payment" | "certificate" = isAjk ? selectedKind : "payment";
            await setDoc(
                doc(db, "users", emailKey),
                {
                    renewals: arrayUnion({
                        id: renewalId,
                        kind: effectiveKind,
                        amount: effectiveKind === "certificate" ? 0 : 5,
                        submittedAtMillis: Date.now(),
                        // keep both fields distinct for admin view compatibility
                        ...(effectiveKind === "certificate" ? { certificateUrl: url } : { screenshotUrl: url, paymentMethod: "bank_transfer" }),
                        status: "pending",
                    }),
                },
                { merge: true }
            );

            setUploading(false);
            Alert.alert(t('success'), t('renewalSubmitted'));
            // navigation.goBack();
        } catch (err: any) {
            setUploading(false);
            // Improved diagnostics for Firebase Storage errors
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
        <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>{t('renewPKKC')}</Text>
            {isAjk ? (
                <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                        <Button title={'Payment'} onPress={() => setSelectedKind('payment')} />
                        <Button title={'Certificate'} onPress={() => setSelectedKind('certificate')} />
                    </View>
                    <Text>
                        {selectedKind === 'certificate' ? (t('uploadCertificateInstruction') || 'ACTIVE members: Please upload your latest program certificate (no payment required).') : t('transferInstruction')}
                    </Text>
                </View>
            ) : (
                <Text style={{ marginBottom: 12 }}>
                    {t('transferInstruction')}
                </Text>
            )}

            {imageUri ? <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginVertical: 12 }} /> : null}
            <Button
                title={(isAjk ? (selectedKind === 'certificate') : false) ? (t('pickCertificate') || 'Pick Certificate') : t('pickScreenshot')}
                onPress={pickImage}
            />

            {uploading ? (
                <ActivityIndicator />
            ) : (
                <View style={{ marginTop: 'auto' }}>
                    <Button title={t('submit')} onPress={submitRenewal} />
                </View>
            )}
        </View>
    );
}
