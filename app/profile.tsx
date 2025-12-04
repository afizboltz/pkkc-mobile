import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [user] = useState({
    name: "Mohd Hafizzuddin",
    email: "hafiz@example.com",
    memberId: "#EMAC2025",
    profileImage: "https://picsum.photos/200",
    membershipValidUntil: "31 Dec 2025",
  });

  const documents = [
    { id: "1", name: "Certificate - EMAC 2024", url: "https://example.com/cert.pdf" },
    { id: "2", name: "Receipt - Renewal 2025", url: "https://example.com/receipt.pdf" },
  ];

  const activities = [
    { id: "1", title: "Charity Run 2024", date: "12 Jan 2024" },
    { id: "2", title: "Community Cleanup", date: "4 May 2024" },
    { id: "3", title: "Technical Workshop", date: "8 Jul 2024" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Profile</Text>

      {/* 🧍 Basic Info */}
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileMemberId}>{user.memberId}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 📄 Documents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documents</Text>
        {documents.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={styles.documentItem}
            onPress={() => Linking.openURL(doc.url)}
          >
            <Ionicons name="document-outline" size={22} color="#007AFF" />
            <Text style={styles.documentName}>{doc.name}</Text>
            <Ionicons name="download-outline" size={20} color="#777" />
          </TouchableOpacity>
        ))}
      </View>

      {/* 💳 Renewal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membership Renewal</Text>
        <View style={styles.renewalCard}>
          <Text style={styles.renewalText}>
            Membership valid until:{" "}
            <Text style={{ fontWeight: "700" }}>{user.membershipValidUntil}</Text>
          </Text>
          <TouchableOpacity style={styles.renewButton}>
            <Ionicons name="cash-outline" size={18} color="#fff" />
            <Text style={styles.renewText}>Renew Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🏃 Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activities Joined</Text>
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.activityCard}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDate}>{item.date}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  profileEmail: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  profileMemberId: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  documentName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  renewalCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  renewalText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  renewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 8,
  },
  renewText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  activityDate: {
    fontSize: 13,
    color: "#777",
  },
});
