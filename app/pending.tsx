import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PendingScreen() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleCheckStatus = () => {
        setIsRefreshing(true);
        // TODO: Add Firestore or API check here
        setTimeout(() => {
            setIsRefreshing(false);
            alert("Your account is still pending approval. Please check again later.");
        }, 1500);
    };

    return (
        <View style={styles.container}>
            {/* 🕒 Illustration */}
            <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/1028/1028971.png" }}
                style={styles.illustration}
            />

            {/* 🧾 Message */}
            <Text style={styles.title}>Account Pending Approval</Text>
            <Text style={styles.subtitle}>
                Thank you for registering! Your account is currently under review by our admin team.
                You’ll be notified once it’s approved.
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
                    {isRefreshing ? "Checking..." : "Check Status"}
                </Text>
            </TouchableOpacity>

            {/* 📞 Contact Support */}
            <View style={styles.supportContainer}>
                <Text style={styles.supportText}>Need help?</Text>
                <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() =>
                        // Replace number with your WhatsApp contact
                        Linking.openURL("https://wa.me/60123456789?text=Hi, I just registered and my account is pending approval.")
                    }
                >
                    <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                    <Text style={styles.whatsappText}>Contact Admin</Text>
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
