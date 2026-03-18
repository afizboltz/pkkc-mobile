import { ThemedText } from "@/src/components/ThemedText";
import { Card } from "@/src/components/ui/Card";
import { getAnnouncements } from "@/src/services/announcement";
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from "@/src/theme";
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
import Animated, { FadeInDown, FadeInUp, SlideInRight } from "react-native-reanimated";
import { Avatar } from "react-native-paper";
import ParsedText from 'react-native-parsed-text';


interface Announcement {
  id: string;
  message?: string;
  date?: string;
  images?: string[];
  title?: string;
  description?: string;
  createdAt?: { toDate: () => Date };
}

export default function AnnouncementScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
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

  const handlePhonePress = (phone: string) => {
    const clean = phone.replace(/\s/g, '');
    Linking.openURL(`tel:${clean}`);
  };

  const handleUrlPress = (url: string) => {
    Linking.openURL(url);
  };

  const renderAnnouncement = ({ item, index }: { item: Announcement; index: number }) => (
    <Animated.View 
      entering={FadeInUp.duration(400).delay(index * 100).springify()}
    >
      <View style={styles.messageRow}>
        <Avatar.Icon
          icon="bullhorn"
          size={40}
          style={styles.avatar}
          color={ColorPalette.white}
        />
        <Card variant="elevated" padding="md" style={styles.messageBubble}>
          {item.images && item.images.length > 0 && (
            <View style={styles.imageGrid}>
              {item.images.map((img: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => openImage(img)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: img }}
                    style={[
                      styles.image,
                      item.images?.length === 1
                        ? styles.singleImage
                        : item.images?.length === 2
                          ? styles.twoImage
                          : styles.multiImage,
                    ]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {item.title ? (
            <ThemedText type="titleMedium" style={styles.titleText}>{item.title}</ThemedText>
          ) : null}

          {item.description ? (
            <ParsedText
              style={styles.messageText}
              parse={[
                { type: 'url', style: { color: ColorPalette.primary[500] }, onPress: handleUrlPress },
                { type: 'phone', style: { color: ColorPalette.primary[500] }, onPress: handlePhonePress }
              ]}
            >
              {item.description}
            </ParsedText>
          ) : null}

          <View style={styles.timeContainer}>
            <ThemedText type="caption" style={styles.timeText}>
              {item.createdAt ? dayjs(item.createdAt.toDate()).format("h:mm A") : dayjs(item.date).format("h:mm A")}
            </ThemedText>
          </View>
        </Card>
      </View>
    </Animated.View>
  );

  const renderSection = ({ item, index }: { item: { title: string; data: Announcement[] }; index: number }) => (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 50)}>
      <View style={styles.dateChip}>
        <ThemedText type="labelMedium" style={styles.dateText}>{item.title}</ThemedText>
      </View>
      {item.data.map((msg, idx) => (
        <View key={msg.id}>
          {renderAnnouncement({ item: msg, index: idx })}
        </View>
      ))}
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ColorPalette.primary[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Avatar.Icon
              icon="bell-off-outline"
              size={64}
              style={styles.emptyIcon}
              color={ColorPalette.gray[400]}
            />
            <ThemedText type="titleMedium" style={styles.emptyText}>No announcements yet</ThemedText>
            <ThemedText type="bodySmall" style={styles.emptySubtext}>Check back later for updates</ThemedText>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Animated.View 
          style={styles.modalContainer}
          entering={FadeInDown.duration(300)}
        >
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Avatar.Icon
                icon="close"
                size={32}
                style={styles.closeIcon}
                color={ColorPalette.white}
              />
            </TouchableOpacity>
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get("window");
const bubbleWidth = width * 0.75;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ColorPalette.gray[50],
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  dateChip: {
    alignSelf: "center",
    backgroundColor: ColorPalette.success[100],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  dateText: {
    color: ColorPalette.success[700],
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  avatar: {
    backgroundColor: ColorPalette.success[500],
    marginRight: Spacing.sm,
  },
  messageBubble: {
    flex: 1,
    maxWidth: "85%",
    ...Shadow.sm,
  },
  messageText: {
    marginTop: Spacing.xs,
    color: ColorPalette.gray[700],
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  timeContainer: {
    alignSelf: "flex-end",
    marginTop: Spacing.sm,
  },
  timeText: {
    color: ColorPalette.gray[400],
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
  titleText: {
    marginBottom: Spacing.xs,
    color: ColorPalette.gray[800],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalImage: {
    width: '95%',
    height: '80%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    backgroundColor: ColorPalette.gray[100],
    marginBottom: Spacing.md,
  },
  emptyText: {
    color: ColorPalette.gray[600],
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    color: ColorPalette.gray[400],
  },
});
