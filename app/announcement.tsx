import { ThemedText } from "@/src/components/ThemedText";
import { Card } from "@/src/components/ui";
import { getAnnouncements } from "@/src/services/announcement";
import { BorderRadius, ColorPalette, Shadow, Spacing } from "@/src/theme";
import { printLog } from "@/src/utils/log";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar } from "react-native-paper";
import ParsedText from 'react-native-parsed-text';


interface Announcement {
  id: string;
  message?: string;
  date: string; // ISO format
  images?: string[];
}

const announcements: Announcement[] = [
  {
    id: "1",
    message: "Welcome to our new announcement board 🎉",
    date: "2025-11-01T09:00:00",
  },
  {
    id: "2",
    message: "System maintenance tonight from 12AM to 2AM.",
    date: "2025-11-02T10:00:00",
    images: [
      "https://picsum.photos/400/200?random=1",
      "https://picsum.photos/400/200?random=2",
    ],
  },
  {
    id: "3",
    message: "New feature added: Dark Mode 🌙",
    date: "2025-11-02T16:30:00",
    images: [
      "https://picsum.photos/400/200?random=3",
      "https://picsum.photos/400/200?random=4",
      "https://picsum.photos/400/200?random=5",
    ],
  },
  {
    id: "4",
    message: "Reminder: Submit your reports before Friday.",
    date: "2025-11-03T09:15:00",
  },
];

export default function AnnouncementScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const fetchedAnnouncements = await getAnnouncements();
        printLog('fetchedAnnouncements', fetchedAnnouncements)
        setAnnouncements(fetchedAnnouncements);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Group announcements by date
  const grouped = announcements.reduce((acc, item) => {
    const date = dayjs(item.date).format("MMMM D, YYYY");
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, Announcement[]>);

  const sections = Object.keys(grouped).map((date) => ({
    title: date,
    data: grouped[date],
  }));

  const openImage = (imageUri: string) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const handlePhonePress = (phone) => {
    const clean = phone.replace(/\s/g, '');
    Linking.openURL(`tel:${clean}`);
  };

  const handleUrlPress = (url) => {
    Linking.openURL(url);
  };


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={{ marginBottom: Spacing.md }}>
            <View style={styles.dateChip}>
              <ThemedText type="labelMedium" style={styles.dateText}>{item.title}</ThemedText>
            </View>

            {item.data.map((msg) => (
              <View key={msg.id} style={styles.messageRow}>
                <Avatar.Icon
                  icon="bullhorn"
                  size={36}
                  style={styles.avatar}
                  color="white"
                />
                <Card variant="elevated" padding="sm" style={styles.messageBubble}>
                  {/* Image Grid */}
                  {msg.images && msg.images.length > 0 && (
                    <View style={styles.imageGrid}>
                      {msg.images.map((img, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => openImage(img)}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={{ uri: img }}
                            style={[
                              styles.image,
                              msg?.images?.length === 1
                                ? styles.singleImage
                                : msg?.images?.length === 2
                                  ? styles.twoImage
                                  : styles.multiImage,
                            ]}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Title text */}
                  {msg.title ? (
                    <ThemedText type="titleMedium" style={styles.titleText}>{msg.title}</ThemedText>
                  ) : null}

                  {/* Message text */}
                  {msg.description ? (
                    <ParsedText
                      style={styles.messageText}
                      parse={[
                        { type: 'url', style: { color: ColorPalette.primary[500] }, onPress: handleUrlPress },
                        { type: 'phone', style: { color: ColorPalette.primary[500] }, onPress: handlePhonePress }
                      ]}
                    >
                      {msg.description}
                    </ParsedText>

                  ) : null}

                  {/* Timestamp */}
                  <ThemedText type="caption" style={styles.timeText}>
                    {dayjs(msg.createdAt.toDate()).format("h:mm A")}
                  </ThemedText>
                </Card>
              </View>
            ))}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Image Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get("window");
const bubbleWidth = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.white,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  dateChip: {
    alignSelf: "center",
    backgroundColor: ColorPalette.success[100],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dateText: {
    color: ColorPalette.success[700],
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  avatar: {
    backgroundColor: ColorPalette.success[500],
    marginRight: Spacing.sm,
  },
  messageBubble: {
    maxWidth: "80%",
    ...Shadow.sm,
  },
  messageText: {
    marginTop: Spacing.xs,
  },
  timeText: {
    alignSelf: "flex-end",
    marginTop: Spacing.xs,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  image: {
    borderRadius: BorderRadius.md,
    backgroundColor: ColorPalette.gray[200],
  },
  singleImage: {
    width: bubbleWidth,
    height: 180,
  },
  twoImage: {
    width: bubbleWidth / 2 - Spacing.sm,
    height: 120,
  },
  multiImage: {
    width: bubbleWidth / 3 - Spacing.sm,
    height: 100,
  },
  captionContainer: {
    padding: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  captionText: {
    color: ColorPalette.white,
    fontSize: 14,
    textAlign: "center",
  },
  titleText: {
    marginBottom: Spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },
});
