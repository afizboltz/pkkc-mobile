import { getAnnouncements } from "@/src/services/announcement";
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
  Text,
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
          <View style={{ marginBottom: 16 }}>
            <View style={styles.dateChip}>
              <Text style={styles.dateText}>{item.title}</Text>
            </View>

            {item.data.map((msg) => (
              <View key={msg.id} style={styles.messageRow}>
                <Avatar.Icon
                  icon="bullhorn"
                  size={36}
                  style={styles.avatar}
                  color="white"
                />
                <View style={styles.messageBubble}>
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
                    <Text style={styles.titleText}>{msg.title}</Text>
                  ) : null}

                  {/* Message text */}
                  {msg.description ? (
                    <ParsedText
                      style={styles.messageText}
                      parse={[
                        { type: 'url', style: { color: 'blue' }, onPress: handleUrlPress },
                        { type: 'phone', style: { color: 'blue' }, onPress: handlePhonePress }
                      ]}
                    >
                      {msg.description}
                    </ParsedText>

                  ) : null}

                  {/* Timestamp */}
                  <Text style={styles.timeText}>
                    {dayjs(msg.createdAt.toDate()).format("h:mm A")}
                  </Text>
                </View>
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
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  dateChip: {
    alignSelf: "center",
    backgroundColor: "#D1F0E0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#075E54",
    fontWeight: "500",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: "#25D366",
    marginRight: 8,
  },
  messageBubble: {
    backgroundColor: "#F6F8FA",
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  messageText: {
    fontSize: 15,
    color: "#222",
    marginTop: 6,
  },
  timeText: {
    fontSize: 11,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  image: {
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  singleImage: {
    width: bubbleWidth,
    height: 180,
  },
  twoImage: {
    width: bubbleWidth / 2 - 6,
    height: 120,
  },
  multiImage: {
    width: bubbleWidth / 3 - 6,
    height: 100,
  },
  captionContainer: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  captionText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  titleText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "bold",
    marginBottom: 6,
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
