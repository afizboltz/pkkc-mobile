import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useTranslation } from "@/src/i18n";
import { getRenewalStatusFromProfile } from "@/src/services/renewMembership";
import { useAuth } from "../src/hooks/useAuth";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from "@/src/theme";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  const { t } = useTranslation();

  const documents: { id: string; name: string; url: string }[] = [];

  const activities: { id: string; title: string; date: string }[] = [];

  const getProfilePicture = (userPic: string) => {
    if (userPic) {
      return { uri: userPic } as const;
    } else {
      return require('../src/assets/images/placeholder/userDefault.png');
    }
  };

  const renewStatus = getRenewalStatusFromProfile(userProfile);

  const getStatusColor = () => {
    switch (renewStatus) {
      case "near_expiry":
        return ColorPalette.warning[500];
      case "pending":
        return ColorPalette.info[500];
      case "completed":
        return ColorPalette.success[500];
      default:
        return ColorPalette.gray[500];
    }
  };

  const getStatusText = () => {
    switch (renewStatus) {
      case "near_expiry":
        return t('renewNow');
      case "pending":
        return t('pendingApprovalByAdmin');
      case "completed":
        return t('renewalCompleted');
      default:
        return '';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <AnimatedView entering={FadeInDown.duration(500).springify()}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profileHeader')}</Text>
        </View>
      </AnimatedView>

      <AnimatedView entering={FadeInUp.duration(500).delay(100).springify()}>
        <Card variant="elevated" padding="lg">
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image source={getProfilePicture(userProfile?.profileImage)} style={styles.profileImage} />
              <View style={styles.editButton}>
                <Ionicons name="camera" size={16} color={ColorPalette.white} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile?.fullName}</Text>
              <Text style={styles.profileEmail}>{userProfile?.email}</Text>
              <View style={styles.memberIdContainer}>
                <Ionicons name="card" size={14} color={ColorPalette.primary[500]} />
                <Text style={styles.profileMemberId}>{userProfile?.pkkcID}</Text>
              </View>
            </View>
          </View>
        </Card>
      </AnimatedView>

      <AnimatedView entering={FadeInUp.duration(500).delay(200).springify()}>
        <Card variant="elevated" padding="lg" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color={ColorPalette.primary[500]} />
            <Text style={styles.sectionTitle}>{t('documents')}</Text>
          </View>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <TouchableOpacity key={doc.id} style={styles.documentItem}>
                <Ionicons name="document-outline" size={22} color={ColorPalette.primary[500]} />
                <Text style={styles.documentName}>{doc.name}</Text>
                <Ionicons name="download-outline" size={20} color={ColorPalette.gray[400]} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.comingSoonContainer}>
              <Ionicons name="time-outline" size={32} color={ColorPalette.gray[300]} />
              <Text style={styles.comingSoonText}>{t('comingSoonText')}</Text>
            </View>
          )}
        </Card>
      </AnimatedView>

      <AnimatedView entering={FadeInUp.duration(500).delay(300).springify()}>
        <Card variant="elevated" padding="lg" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color={ColorPalette.success[500]} />
            <Text style={styles.sectionTitle}>{t('membershipRenewal')}</Text>
          </View>
          <View style={styles.renewalCard}>
            <View style={styles.renewalInfo}>
              <Text style={styles.renewalLabel}>{t('membershipValidUntil')}</Text>
              <Text style={styles.renewalValue}>{userProfile?.membershipExpiry || 'N/A'}</Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
            </View>

            {renewStatus === "near_expiry" && (
              <Button 
                variant="primary" 
                size="md" 
                fullWidth
                onPress={() => navigation.navigate('renewMembership' as never)}
                style={styles.renewButton}
              >
                <Ionicons name="cash-outline" size={18} color={ColorPalette.white} />
                <Text style={styles.renewButtonText}>{t('renewNow')}</Text>
              </Button>
            )}
          </View>
        </Card>
      </AnimatedView>

      <AnimatedView entering={FadeInUp.duration(500).delay(400).springify()}>
        <Card variant="elevated" padding="lg" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={ColorPalette.info[500]} />
            <Text style={styles.sectionTitle}>{t('activitiesJoined')}</Text>
          </View>
          {activities.length > 0 ? (
            <FlatList
              data={activities}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.activityCard}>
                  <Ionicons name="calendar-outline" size={20} color={ColorPalette.info[500]} />
                  <View style={{ marginLeft: Spacing.md }}>
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
        </Card>
      </AnimatedView>

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
  header: {
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
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
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
  },
  profileEmail: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[500],
    marginTop: 2,
  },
  memberIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    backgroundColor: ColorPalette.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  profileMemberId: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.primary[600],
    fontWeight: Typography.fontWeight.medium,
    marginLeft: 4,
  },
  sectionCard: {
    marginTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.gray[800],
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ColorPalette.gray[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  documentName: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[700],
  },
  renewalCard: {
    backgroundColor: ColorPalette.gray[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  renewalInfo: {
    marginBottom: Spacing.sm,
  },
  renewalLabel: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.gray[500],
  },
  renewalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[800],
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  renewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  renewButtonText: {
    color: ColorPalette.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ColorPalette.gray[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
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
