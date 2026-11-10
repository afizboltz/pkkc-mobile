import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTranslation } from "@/src/i18n";
import { ColorPalette, Spacing, Typography } from "@/src/theme";

// Defense-in-depth for the admin/ajk-only screens: these are only hidden via
// the dashboard tile today, not self-guarded, so RLS was the sole backstop.
export function NotAuthorized() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Ionicons name="lock-closed-outline" size={48} color={ColorPalette.gray[300]} />
      <Text style={styles.title}>{t('notAuthorizedTitle')}</Text>
      <Text style={styles.message}>{t('notAuthorizedMessage')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: ColorPalette.white,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[800],
    marginTop: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[500],
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});

export const isStaffRole = (role: string | null | undefined) => role === 'admin' || role === 'ajk';
