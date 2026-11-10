import { Avatar, Button, Card, ChipGroup, SearchBar } from "@/src/components/ui";
import { useAccessLevel } from "@/src/hooks/useAccessLevel";
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from "@/src/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardDismissView } from "@/src/components/KeyboardDismissView";

interface Business {
  id: string;
  name: string;
  category: string;
  images: string[];
  description: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
}

const businesses: Business[] = [
  {
    id: "1",
    name: "Dapur Kita",
    category: "Makanan & Minuman",
    images: [
      "https://picsum.photos/400/400?random=201",
      "https://picsum.photos/400/400?random=202",
    ],
    description: "Katering dan juadah rumah untuk majlis komuniti — tempahan harian dan mingguan.",
    whatsapp: "+60123456701",
    instagram: "dapurkita.cs",
  },
  {
    id: "2",
    name: "Kedai Runcit Cybersouth",
    category: "Barangan Harian",
    images: [
      "https://picsum.photos/400/400?random=203",
      "https://picsum.photos/400/400?random=204",
    ],
    description: "Keperluan harian, barangan dapur dan runcit untuk penduduk Kita Cybersouth.",
    whatsapp: "+60123456702",
  },
  {
    id: "3",
    name: "Cik Ais Corner",
    category: "Minuman & Pencuci Mulut",
    images: [
      "https://picsum.photos/400/400?random=205",
      "https://picsum.photos/400/400?random=206",
    ],
    description: "Minuman sejuk, ais kepal dan pencuci mulut — sesuai untuk acara komuniti.",
    whatsapp: "+60123456703",
    facebook: "cikaiscorner",
  },
  {
    id: "4",
    name: "Kita Fresh Farm",
    category: "Buah-buahan & Sayur-sayuran",
    images: [
      "https://picsum.photos/400/400?random=207",
      "https://picsum.photos/400/400?random=208",
    ],
    description: "Buah-buahan dan sayur-sayuran segar, dihantar terus ke rumah anda.",
    whatsapp: "+60123456704",
    instagram: "kitafreshfarm",
  },
  {
    id: "5",
    name: "Servis Rumah CS",
    category: "Servis & Pembaikan",
    images: [
      "https://picsum.photos/400/400?random=209",
      "https://picsum.photos/400/400?random=210",
    ],
    description: "Servis pembaikan rumah: paip, elektrik dan penyelenggaraan am.",
    whatsapp: "+60123456705",
  },
  {
    id: "6",
    name: "Kek & Pastri by Nur",
    category: "Kek & Pastri",
    images: [
      "https://picsum.photos/400/400?random=211",
      "https://picsum.photos/400/400?random=212",
    ],
    description: "Kek sambutan, pastri dan kuih-muih buatan sendiri untuk setiap majlis.",
    whatsapp: "+60123456706",
    instagram: "nurkekpastri",
  },
];

const categoryChips = [
  { key: "semua", label: "Semua" },
  { key: "makanan", label: "Makanan" },
  { key: "minuman", label: "Minuman" },
  { key: "servis", label: "Servis" },
];

export default function DirektoriPeniagaScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [selectedItem, setSelectedItem] = useState<Business | null>(null);
  const accessLevel = useAccessLevel();

  const filteredItems = businesses.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "semua" ||
      item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const openWhatsApp = (number: string, message?: string) => {
    const cleanNumber = number.replace(/[^0-9+]/g, "");
    const url = `https://wa.me/${cleanNumber.replace("+", "")}?text=${encodeURIComponent(
      message || "Hai, saya berminat dengan perkhidmatan anda!"
    )}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Ralat", "WhatsApp tidak dipasang atau pautan tidak dapat dibuka.");
    });
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert("Ralat", "Tidak dapat membuka pautan."));
  };

  const onPressMohonTapakNiaga = () => {
    if (accessLevel === "guest") {
      router.push("/login");
      return;
    }
    Alert.alert(
      "Mohon Tapak Niaga",
      "Permohonan anda akan disemak oleh pentadbir. Akan datang tidak lama lagi."
    );
  };

  const renderItem = ({ item }: { item: Business }) => (
    <TouchableOpacity style={styles.row} onPress={() => setSelectedItem(item)} activeOpacity={0.8}>
      <Avatar name={item.name} size={48} />
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowCategory} numberOfLines={1}>{item.category}</Text>
      </View>
      <TouchableOpacity
        style={styles.whatsappIconBtn}
        onPress={() => openWhatsApp(item.whatsapp, `Hai! Saya berminat dengan "${item.name}".`)}
      >
        <MaterialCommunityIcons name="whatsapp" size={22} color={ColorPalette.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderList = () => (
    <KeyboardDismissView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Direktori Peniaga</Text>
        <Text style={styles.subtitle}>Cari perniagaan tempatan di Kita Cybersouth</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari peniaga, produk atau kategori" />
      </View>

      <View style={styles.chipContainer}>
        <ChipGroup options={categoryChips} selectedKey={selectedCategory} onSelect={setSelectedCategory} />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={ColorPalette.gray[300]} />
            <Text style={styles.emptyText}>Tiada peniaga ditemui</Text>
          </View>
        }
        ListFooterComponent={
          <Button variant="success" fullWidth onPress={onPressMohonTapakNiaga} style={styles.applyButton}>
            Mohon Tapak Niaga
          </Button>
        }
      />
    </KeyboardDismissView>
  );

  const renderDetails = (item: Business) => (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedItem(null)}>
          <Ionicons name="arrow-back" size={22} color={ColorPalette.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.carouselContainer}>
        <FlatList
          data={item.images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item: img }) => <Image source={{ uri: img }} style={styles.carouselImage} />}
        />
      </View>

      <View style={styles.detailContent}>
        <Card variant="elevated" padding="lg" style={styles.detailCard}>
          <Text style={styles.detailTitle}>{item.name}</Text>
          <Text style={styles.detailCategory}>{item.category}</Text>
          <Text style={styles.detailDesc}>{item.description}</Text>

          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Hubungi Peniaga</Text>

            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => openWhatsApp(item.whatsapp, `Hai! Saya berminat dengan "${item.name}".`)}
            >
              <MaterialCommunityIcons name="whatsapp" size={22} color={ColorPalette.white} />
              <Text style={styles.whatsappButtonText}>Chat di WhatsApp</Text>
            </TouchableOpacity>

            {item.instagram && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openLink(`https://instagram.com/${item.instagram}`)}
              >
                <MaterialCommunityIcons name="instagram" size={20} color={ColorPalette.gray[700]} />
                <Text style={styles.socialText}>@{item.instagram}</Text>
              </TouchableOpacity>
            )}

            {item.facebook && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => openLink(`https://facebook.com/${item.facebook}`)}
              >
                <MaterialCommunityIcons name="facebook" size={20} color={ColorPalette.gray[700]} />
                <Text style={styles.socialText}>{item.facebook}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </View>
    </View>
  );

  return selectedItem ? renderDetails(selectedItem) : renderList();
}

const { width } = Dimensions.get("window");

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
    marginBottom: Spacing.sm,
  },
  chipContainer: {
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.gray[900],
  },
  rowCategory: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.gray[500],
    marginTop: 2,
  },
  whatsappIconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: ColorPalette.success[500],
    alignItems: "center",
    justifyContent: "center",
  },
  applyButton: {
    marginTop: Spacing.sm,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
  },
  detailHeader: {
    position: "absolute",
    top: 50,
    left: Spacing.md,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  carouselContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: ColorPalette.gray[900],
  },
  carouselImage: {
    width,
    height: "100%",
    resizeMode: "cover",
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
  detailCategory: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.brandPink[600],
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[400],
    marginTop: Spacing.md,
  },
});
