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

    const emailKey = userProfile?.email!.toLowerCase().trim();

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "We need permission to access your photos.");
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
            Alert.alert("Not signed in");
            return;
        }
        if (!imageUri) {
            Alert.alert("Please upload a screenshot of your payment.");
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
            await setDoc(
                doc(db, "users", emailKey),
                {
                    renewals: arrayUnion({
                        id: renewalId,
                        amount: 5,
                        submittedAtMillis: Date.now(),
                        screenshotUrl: url,
                        status: "pending",
                        paymentMethod: "bank_transfer",
                    }),
                },
                { merge: true }
            );

            setUploading(false);
            Alert.alert("Success", "Renewal submitted. Admin will verify shortly.");
            // navigation.goBack();
        } catch (err: any) {
            setUploading(false);
            // Improved diagnostics for Firebase Storage errors
            const code = err?.code;
            const serverResponse = err?.customData?.serverResponse;
            console.error("Upload error:", code, err?.message, serverResponse);
            Alert.alert(
                "Upload failed",
                `${err?.message || "Unknown error"}${code ? `\nCode: ${code}` : ""}`
            );
        }
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Renew PKKC Membership — RM5</Text>
            <Text style={{ marginBottom: 12 }}>
                Please transfer RM5 to this account: {"\n"}Bank: Maybank {"\n"}Acc: 568603091070 {"\n"}Reference: 'Renew PKKC Membership'
            </Text>

            <Button title="Pick Screenshot" onPress={pickImage} />
            {imageUri ? <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginVertical: 12 }} /> : null}

            {uploading ? (
                <ActivityIndicator />
            ) : (
                <Button title="Submit Renewal (Upload screenshot)" onPress={submitRenewal} />
            )}
        </View>
    );
}
