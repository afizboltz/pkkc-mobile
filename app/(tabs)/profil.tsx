import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ListRow } from "@/src/components/ui";
import { useTranslation } from "@/src/i18n";
import { logoutUser, requestAccountDeletion } from "@/src/services/auth";
import { useAuth } from "@/src/hooks/useAuth";
import { BorderRadius, ColorPalette, Spacing, Typography } from "@/src/theme";

export default function ProfileScreen() {
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

  const handleSignOut = async () => {
    try {
      await logoutUser();
      router.replace('/login');
    } catch (e: any) {
      Alert.alert(t('signOutFailed'), e?.message || t('pleaseTryAgain'));
    }
  };

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

      <View style={styles.listPanel}>
        <ListRow icon="badge" label="Ahli PKKC" onPress={() => router.push('/keahlian' as any)} />
        <ListRow icon="event" label="Program Saya" onPress={() => router.push('/program' as any)} />
        <ListRow icon="report-problem" label="Aduan Saya" onPress={() => router.push('/aduan' as any)} />
        <ListRow
          icon="storefront"
          label="Peniaga Saya"
          onPress={() => Alert.alert('Peniaga Saya', 'Anda belum mendaftar sebagai peniaga.')}
        />
        <ListRow icon="notifications" label="Makluman & Notifikasi" onPress={() => router.push('/notifikasi' as any)} />
        <ListRow icon="key" label={t('changePassword')} onPress={() => router.push('/changePassword')} />
        <ListRow
          icon="delete-outline"
          iconColor={ColorPalette.error[500]}
          label={t('requestAccountDeletion')}
          onPress={onRequestAccountDeletion}
        />
        <ListRow icon="help-outline" label="Bantuan & Hubungi Kami" onPress={() => router.push('/directory')} />
        <ListRow
          icon="logout"
          iconColor={ColorPalette.error[500]}
          labelColor={ColorPalette.error[500]}
          label="Log Keluar"
          onPress={handleSignOut}
          showChevron={false}
        />
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
  listPanel: {
    backgroundColor: ColorPalette.white,
    borderWidth: 1,
    borderColor: ColorPalette.gray[200],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
});
