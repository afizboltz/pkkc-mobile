import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Card } from "@/src/components/ui/Card";
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from "@/src/theme";

interface Item {
  id: string;
  name: string;
  price: string;
  images: string[];
  description: string;
  isFavorite?: boolean;
  whatsapp: string;
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

  const renderItem = ({ item, index }: { item: Item; index: number }) => (
    <Animated.View entering={FadeInUp.duration(400).delay(index * 100)} style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedItem(item)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.image} />
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons
              name={item.isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={item.isFavorite ? ColorPalette.error[500] : ColorPalette.gray[500]}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemPrice}>{item.price}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderList = () => (
    <View style={styles.container}>
      <Animated.View 
        style={styles.headerContainer}
        entering={FadeInDown.duration(500)}
      >
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>Find great deals from your neighbors</Text>
      </Animated.View>

      <Animated.View 
        style={styles.searchContainer}
        entering={FadeInUp.duration(400).delay(100)}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={ColorPalette.gray[400]} />
          <TextInput
            placeholder="Search items..."
            placeholderTextColor={ColorPalette.gray[400]}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={ColorPalette.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(200)}>
        <FlatList
          data={filteredItems}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={ColorPalette.gray[300]} />
              <Text style={styles.emptyText}>No items found</Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );

  const renderDetails = (item: Item) => (
    <View style={styles.detailContainer}>
      <Animated.View 
        style={styles.detailHeader}
        entering={FadeIn.duration(300)}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setSelectedItem(null)}
        >
          <Ionicons name="arrow-back" size={22} color={ColorPalette.white} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.carouselContainer}>
        <FlatList
          data={item.images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item: img }) => (
            <Image source={{ uri: img }} style={styles.carouselImage} />
          )}
        />
      </View>

      <Animated.View 
        style={styles.detailContent}
        entering={FadeInUp.duration(400).delay(100)}
      >
        <Card variant="elevated" padding="lg" style={styles.detailCard}>
          <Text style={styles.detailTitle}>{item.name}</Text>
          <Text style={styles.detailPrice}>{item.price}</Text>
          <Text style={styles.detailDesc}>{item.description}</Text>

          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Contact Seller</Text>

            <TouchableOpacity
              style={styles.whatsappButton}
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
                color={ColorPalette.white}
              />
              <Text style={styles.whatsappButtonText}>Chat on WhatsApp</Text>
            </TouchableOpacity>

            {item.instagram && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openLink(`https://instagram.com/${item.instagram}`)}
              >
                <MaterialCommunityIcons
                  name="instagram"
                  size={20}
                  color={ColorPalette.gray[700]}
                />
                <Text style={styles.socialText}>@{item.instagram}</Text>
              </TouchableOpacity>
            )}

            {item.facebook && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openLink(`https://facebook.com/${item.facebook}`)}
              >
                <MaterialCommunityIcons
                  name="facebook"
                  size={20}
                  color={ColorPalette.gray[700]}
                />
                <Text style={styles.socialText}>{item.facebook}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </Animated.View>
    </View>
  );

  return selectedItem ? renderDetails(selectedItem) : renderList();
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Spacing.md * 3) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
    paddingHorizontal: Spacing.md,
  },
  headerContainer: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[500],
    marginTop: 2,
  },
  searchContainer: {
    marginBottom: Spacing.md,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: ColorPalette.gray[200],
    ...Shadow.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[700],
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: Spacing.md,
  },
  card: {
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadow.sm,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
  },
  favoriteBtn: {
    position: 'absolute',
    right: Spacing.sm,
    top: Spacing.sm,
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.full,
    padding: 6,
    ...Shadow.sm,
  },
  cardContent: {
    padding: Spacing.md,
  },
  itemName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.gray[800],
  },
  itemPrice: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.success[600],
    fontWeight: Typography.fontWeight.bold,
    marginTop: 4,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
  },
  detailHeader: {
    position: 'absolute',
    top: 50,
    left: Spacing.md,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  carouselContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: ColorPalette.gray[900],
  },
  carouselImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  detailContent: {
    flex: 1,
    marginTop: -Spacing.xl,
  },
  detailCard: {
    flex: 1,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  detailTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
    marginBottom: Spacing.xs,
  },
  detailPrice: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.success[600],
    marginBottom: Spacing.md,
  },
  detailDesc: {
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[600],
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  sellerSection: {
    borderTopWidth: 1,
    borderTopColor: ColorPalette.gray[200],
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.gray[800],
    marginBottom: Spacing.md,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ColorPalette.success[500],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  whatsappButtonText: {
    color: ColorPalette.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: ColorPalette.gray[100],
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  socialText: {
    color: ColorPalette.gray[700],
    fontSize: Typography.fontSize.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[400],
    marginTop: Spacing.md,
  },
});
