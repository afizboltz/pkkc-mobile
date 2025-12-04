import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Item {
  id: string;
  name: string;
  price: string;
  images: string[];
  description: string;
  isFavorite?: boolean;
  whatsapp: string; // required
  instagram?: string;
  facebook?: string;
}

const sampleItems: Item[] = [
  {
    id: "1",
    name: "Apple Watch Series 9",
    price: "RM 1,499",
    images: [
      "https://picsum.photos/400/400?random=11",
      "https://picsum.photos/400/400?random=12",
      "https://picsum.photos/400/400?random=13",
    ],
    description:
      "Stay connected, track your workouts, and monitor your health with Apple Watch Series 9.",
    whatsapp: "+60123456789",
    instagram: "applemalaysia",
  },
  {
    id: "2",
    name: "Nike Air Max",
    price: "RM 599",
    images: [
      "https://picsum.photos/400/400?random=21",
      "https://picsum.photos/400/400?random=22",
    ],
    description: "Lightweight and stylish shoes perfect for running or casual wear.",
    whatsapp: "+60198765432",
    facebook: "nike",
  },
];

export default function MarketplaceScreen() {
  const [items, setItems] = useState<Item[]>(sampleItems);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // 🎯 PanResponder for swipe-down/side-close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 10 || Math.abs(gesture.dx) > 10,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100 || gesture.dx > 100) {
          Animated.timing(position, {
            toValue: { x: gesture.dx > 0 ? width : 0, y: height },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setSelectedItem(null);
            position.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFavorite = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const openWhatsApp = (number: string, message?: string) => {
    const cleanNumber = number.replace(/[^0-9+]/g, "");
    const url = `https://wa.me/${cleanNumber.replace("+", "")}?text=${encodeURIComponent(
      message || "Hi, I'm interested in your product!"
    )}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "WhatsApp is not installed or cannot open the link.");
    });
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open link.")
    );
  };

  const renderList = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Marketplace</Text>

      {/* 🔍 Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          placeholder="Search items..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 🛍️ Items Grid */}
      <FlatList
        data={filteredItems}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedItem(item)}
          >
            <Image source={{ uri: item.images[0] }} style={styles.image} />
            <TouchableOpacity
              style={styles.favoriteBtn}
              onPress={() => toggleFavorite(item.id)}
            >
              <Ionicons
                name={item.isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={item.isFavorite ? "#E91E63" : "#555"}
              />
            </TouchableOpacity>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderDetails = (item: Item) => (
    <Animated.View
      style={[
        styles.detailContainer,
        {
          transform: position.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => setSelectedItem(null)}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={styles.carouselContainer}>
        <FlatList
          data={item.images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.carouselImage} />
          )}
        />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailTitle}>{item.name}</Text>
        <Text style={styles.detailPrice}>{item.price}</Text>
        <Text style={styles.detailDesc}>{item.description}</Text>

        {/* 👤 Seller Contact */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Contact Seller</Text>

          {/* ✅ WhatsApp (compulsory) */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() =>
              openWhatsApp(
                item.whatsapp,
                `Hi! I'm interested in your product "${item.name}".`
              )
            }
          >
            <MaterialCommunityIcons
              name="whatsapp"
              size={22}
              color="#25D366"
            />
            <Text style={[styles.contactText, { color: "#25D366" }]}>
              Chat on WhatsApp
            </Text>
          </TouchableOpacity>

          {item.instagram && (
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => openLink(`https://instagram.com/${item.instagram}`)}
            >
              <MaterialCommunityIcons
                name="instagram"
                size={20}
                color="#E1306C"
              />
              <Text style={styles.contactText}>@{item.instagram}</Text>
            </TouchableOpacity>
          )}

          {item.facebook && (
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => openLink(`https://facebook.com/${item.facebook}`)}
            >
              <MaterialCommunityIcons
                name="facebook"
                size={20}
                color="#1877F2"
              />
              <Text style={styles.contactText}>{item.facebook}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );

  return selectedItem ? renderDetails(selectedItem) : renderList();
}

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 6,
    color: "#333",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 140,
  },
  favoriteBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 50,
    padding: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 13,
    color: "#0A8754",
    fontWeight: "600",
    marginBottom: 10,
    marginHorizontal: 8,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  detailImage: {
    width,
    height: 300,

  },
  detailContent: {
    padding: 16,
    backgroundColor: 'yellow'
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  detailPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A8754",
    marginBottom: 10,
  },
  detailDesc: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 20,
  },
  sellerSection: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactText: {
    color: "#333",
    marginLeft: 10,
    fontSize: 14,
  },
  carouselContainer: {
    width: "100%",
    aspectRatio: 1, // ✅ keeps it square and removes extra whitespace
    backgroundColor: "#000", // optional, for contrast
  },

  carouselImage: {
    width: Dimensions.get("window").width,
    height: "100%", // ✅ ensures it fills container
    resizeMode: "cover",
  },
});
