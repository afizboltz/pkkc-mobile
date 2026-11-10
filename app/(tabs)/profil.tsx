import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useNavigation } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "@/src/i18n";
import { requestAccountDeletion } from "@/src/services/auth";
import { useAuth } from "@/src/hooks/useAuth";
import { BorderRadius, ColorPalette, Spacing, Typography } from "@/src/theme";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  const { t } = useTranslation();

  const onRequestAccountDeletion = () => {
    Alert.alert(t('requestAccountDeletionConfirmTitle'), t('requestAccountDeletionConfirmMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('ok'),
        style: 'destructive',
        onPress: async () => {
          try {
            await requestAccountDeletion();
            Alert.alert(t('requestAccountDeletionSuccess'));
            router.replace('/login');
          } catch (e: any) {
            Alert.alert(t('requestAccountDeletionFailed'), e?.message || t('pleaseTryAgain'));
          }
        },
      },
    ]);
  };

  const documents: { id: string; name: string; url: string }[] = [];

  const activities: { id: string; title: string; date: string }[] = [];

  const getProfilePicture = (userPic?: string) => {
    if (userPic) {
      return { uri: userPic } as const;
    } else {
      return require('../../src/assets/images/placeholder/userDefault.png');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[ColorPalette.primary[500], ColorPalette.primary[800]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        <View style={styles.heroAccent} />
        <View style={styles.avatarContainer}>
          <Image source={getProfilePicture(userProfile?.profileImage)} style={styles.profileImage} />
          <View style={styles.editButton}>
            <Ionicons name="camera" size={14} color={ColorPalette.white} />
          </View>
        </View>
        <Text style={styles.profileName}>{userProfile?.fullName}</Text>
        <Text style={styles.profileEmail}>{userProfile?.email}</Text>
        <View style={styles.memberIdPill}>
          <Ionicons name="card" size={13} color={ColorPalette.white} />
          <Text style={styles.profileMemberId}>{userProfile?.pkkcID}</Text>
        </View>
      </LinearGradient>

      <View style={styles.sectionPanel}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: ColorPalette.primary[500] }]}>
            <Ionicons name="document-text" size={15} color={ColorPalette.white} />
          </View>
          <Text style={styles.sectionTitle}>{t('documents')}</Text>
        </View>
        {documents.length > 0 ? (
          documents.map((doc) => (
            <TouchableOpacity key={doc.id} style={styles.row}>
              <Ionicons name="document-outline" size={22} color={ColorPalette.primary[500]} />
              <Text style={styles.rowLabel}>{doc.name}</Text>
              <Ionicons name="download-outline" size={20} color={ColorPalette.gray[400]} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.comingSoonContainer}>
            <Ionicons name="time-outline" size={32} color={ColorPalette.gray[300]} />
            <Text style={styles.comingSoonText}>{t('comingSoonText')}</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionPanel}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: ColorPalette.gray[600] }]}>
            <Ionicons name="settings" size={15} color={ColorPalette.white} />
          </View>
          <Text style={styles.sectionTitle}>{t('account')}</Text>
        </View>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('changePassword' as never)}
        >
          <Ionicons name="key-outline" size={22} color={ColorPalette.primary[500]} />
          <Text style={styles.rowLabel}>{t('changePassword')}</Text>
          <Ionicons name="chevron-forward" size={20} color={ColorPalette.gray[400]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={onRequestAccountDeletion}
        >
          <Ionicons name="trash-outline" size={22} color={ColorPalette.error[500]} />
          <Text style={[styles.rowLabel, { color: ColorPalette.error[500] }]}>{t('requestAccountDeletion')}</Text>
          <Ionicons name="chevron-forward" size={20} color={ColorPalette.gray[400]} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionPanel}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: ColorPalette.info[500] }]}>
            <Ionicons name="calendar" size={15} color={ColorPalette.white} />
          </View>
          <Text style={styles.sectionTitle}>{t('activitiesJoined')}</Text>
        </View>
        {activities.length > 0 ? (
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={20} color={ColorPalette.info[500]} />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDate}>{item.date}</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={styles.comingSoonContainer}>
            <Ionicons name="calendar-outline" size={32} color={ColorPalette.gray[300]} />
            <Text style={styles.comingSoonText}>{t('comingSoonText')}</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  heroHeader: {
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
  },
  heroAccent: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: ColorPalette.white,
    opacity: 0.07,
    top: -70,
    right: -50,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: ColorPalette.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ColorPalette.white,
  },
  profileName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extrabold,
    color: ColorPalette.white,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.white,
    opacity: 0.85,
    marginTop: 2,
    textAlign: 'center',
  },
  memberIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  profileMemberId: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.white,
    fontWeight: Typography.fontWeight.medium,
  },
  sectionPanel: {
    backgroundColor: ColorPalette.white,
    borderWidth: 1,
    borderColor: ColorPalette.gray[200],
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ColorPalette.gray[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[700],
    fontWeight: Typography.fontWeight.medium,
  },
  activityTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: ColorPalette.gray[800],
  },
  activityDate: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.gray[500],
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  comingSoonText: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[400],
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
});
