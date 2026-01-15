import { db } from "@/src/config/firebase";
import { useTranslation } from "@/src/i18n";
import { mmkvAsyncStorage } from "@/src/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
            {/* 🕒 Illustration */}
            <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/1028/1028971.png" }}
                style={styles.illustration}
            />

            {/* 🧾 Message */}
            <Text style={styles.title}>{t('accountPendingApproval')}</Text>
            <Text style={styles.subtitle}>
                {t('pendingThankYou')}
            </Text>

            {/* 🔁 Refresh button */}
            <TouchableOpacity
                style={[styles.refreshButton, isRefreshing && { opacity: 0.6 }]}
                onPress={handleCheckStatus}
                disabled={isRefreshing}
            >
                <Ionicons
                    name={isRefreshing ? "time-outline" : "refresh-outline"}
                    size={20}
                    color="#fff"
                />
                <Text style={styles.refreshText}>
                    {isRefreshing ? t('checking') : t('checkStatus')}
                </Text>
            </TouchableOpacity>

            {/* 📞 Contact Support */}
            <View style={styles.supportContainer}>
                <Text style={styles.supportText}>{t('needHelp')}</Text>
                <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() =>
                        // Replace number with your WhatsApp contact
                        Linking.openURL("https://wa.me/60123456789?text=" + encodeURIComponent(t('whatsappText')))
                    }
                >
                    <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                    <Text style={styles.whatsappText}>{t('contactAdmin')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    illustration: {
        width: 120,
        height: 120,
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#222",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 30,
    },
    refreshButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    refreshText: {
        color: "#fff",
        fontWeight: "600",
        marginLeft: 8,
    },
    supportContainer: {
        marginTop: 40,
        alignItems: "center",
    },
    supportText: {
        color: "#666",
        fontSize: 13,
        marginBottom: 8,
    },
    whatsappButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#25D366",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
    },
    whatsappText: {
        color: "#fff",
        fontWeight: "600",
        marginLeft: 6,
    },
});
