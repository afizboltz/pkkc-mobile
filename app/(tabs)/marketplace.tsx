import React from "react";
import { FlatList, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function MarketplaceScreen() {
  return (
    <ThemedView>
      <ThemedText type="title">Marketplace</ThemedText>
      <FlatList
        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
        renderItem={({ item }) => (
          <ThemedView style={{ padding: 16 }}>
            <ThemedText>Nasi Lemak PKKC</ThemedText>
            <ThemedText>RM 10.00</ThemedText>
            <ThemedText>WhatsApp +60123456789</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
