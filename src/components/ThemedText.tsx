import React from "react";
import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/src/hooks/useThemeColor";
import { LegacyTypographyMap, TypographyStyles } from "@/src/theme/typography";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link" |
  "displayLarge" | "displayMedium" | "displaySmall" |
  "headlineLarge" | "headlineMedium" | "headlineSmall" |
  "titleLarge" | "titleMedium" | "titleSmall" |
  "bodyLarge" | "bodyMedium" | "bodySmall" |
  "labelLarge" | "labelMedium" | "labelSmall" |
  "caption" | "overline" | "code";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  // Use new typography system if available, otherwise fall back to legacy
  const typographyStyle = TypographyStyles[type] || LegacyTypographyMap[type as keyof typeof LegacyTypographyMap] || TypographyStyles.bodyLarge;

  return (
    <Text
      style={[
        { color },
        typographyStyle,
        style,
      ]}
      {...rest}
    />
  );
}

// Keep legacy styles for backward compatibility
const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
