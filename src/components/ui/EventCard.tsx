/**
 * Design System EventCard Component
 * Image banner, date badge, title, location, attendee count, CTA.
 * Used by Program & Aktiviti and the Dashboard's featured-event carousel.
 */

import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from './Button';
import { PlaceholderImage } from './PlaceholderImage';

export interface EventCardProps {
  title: string;
  imageUrl?: string;
  dateLabel: string;
  location: string;
  attendeeCount?: number;
  ctaLabel?: string;
  onPressCta?: () => void;
  onPress?: () => void;
  width?: number;
}

export function EventCard({
  title,
  imageUrl,
  dateLabel,
  location,
  attendeeCount,
  ctaLabel,
  onPressCta,
  onPress,
  width,
}: EventCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, width ? { width } : undefined]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <PlaceholderImage style={styles.image} icon="event" />
        )}
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText} numberOfLines={1}>{dateLabel}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.metaRow}>
          <MaterialIcons name="place" size={14} color={ColorPalette.gray[500]} />
          <Text style={styles.metaText} numberOfLines={1}>{location}</Text>
        </View>
        <View style={styles.footerRow}>
          {typeof attendeeCount === 'number' ? (
            <View style={styles.attendeeRow}>
              <MaterialIcons name="people" size={16} color={ColorPalette.gray[500]} />
              <Text style={styles.attendeeText}>{attendeeCount} peserta</Text>
            </View>
          ) : <View />}
          {ctaLabel ? (
            <Button variant="accent" size="sm" onPress={onPressCta}>
              {ctaLabel}
            </Button>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
  },
  dateBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    ...Shadow.sm,
  },
  dateBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.brandPink[600],
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.gray[500],
    flexShrink: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendeeText: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.gray[500],
  },
});
