/**
 * Design System MemberOnlyGate Component
 * Defense-in-depth guard for member-only screens. Tab-level and menu-level
 * gating already keep guests from navigating here in the normal flow, but a
 * direct router.push(...) call (e.g. from the dashboard header avatar) or a
 * future deep link bypasses those — this is the screen's own backstop,
 * mirroring the existing NotAuthorized.tsx pattern for admin-only screens.
 */

import { useAccessLevel } from '@/src/hooks/useAccessLevel';
import { ColorPalette, Spacing, Typography } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LoginPrompt } from './LoginPrompt';

export interface MemberOnlyGateProps {
  title?: string;
  message: string;
  children: React.ReactNode;
}

export function MemberOnlyGate({ title, message, children }: MemberOnlyGateProps) {
  const accessLevel = useAccessLevel();

  if (accessLevel === 'guest') {
    return (
      <View style={styles.container}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <LoginPrompt message={message} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.extrabold,
    color: ColorPalette.gray[900],
    marginBottom: Spacing.md,
  },
});
