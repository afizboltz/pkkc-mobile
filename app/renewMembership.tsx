import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, Image, Text, View } from "react-native";

const storage = getStorage();
const db = getFirestore();
const auth = getAuth();

export default function RenewMembershipScreen({ navigation }: any) {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "We need permission to access your photos.");
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
            const filename = `renewals/${uid}/${Date.now()}.jpg`;
            const sRef = storageRef(storage, filename);
            await uploadBytes(sRef, blob);
            const url = await getDownloadURL(sRef);

            // create renewal doc
            const renewalRef = await addDoc(collection(db, "users", uid, "renewals"), {
                amount: 5,
                submittedAt: serverTimestamp(),
                screenshotUrl: url,
                status: "pending",
                paymentMethod: "bank_transfer",
            });

            setUploading(false);
            Alert.alert("Success", "Renewal submitted. Admin will verify shortly.");
            navigation.goBack();
        } catch (err: any) {
            setUploading(false);
            console.error(err);
            // console.error("Error", "Failed to submit renewal: " + (err.message || err));
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
