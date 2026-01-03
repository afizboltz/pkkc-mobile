import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/src/hooks/useColorScheme";
import { printLog } from "@/src/utils/log";
import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("@/src/assets/fonts/SpaceMono-Regular.ttf"),
  });


  printLog('loaded', loaded)
  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const ENVIdentifier = () => {
    return (
      <View style={{ backgroundColor: "yellow", height: 30, alignItems: "center", justifyContent: "center" }}>
        <Text>ENV: {process.env.EXPO_PUBLIC_ENV}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <ENVIdentifier />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="preLogin" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: true }} />
            <Stack.Screen name="signup" options={{ headerShown: true }} />
            <Stack.Screen name="pending" options={{ headerShown: true }} />
            <Stack.Screen name="+not-found" />

            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="approval" options={{ headerShown: true }} />
            <Stack.Screen name="renewMembership" options={{ headerShown: true }} />
            <Stack.Screen name="profile" options={{ headerShown: true }} />
            <Stack.Screen name="marketplace" options={{ headerShown: true }} />
            <Stack.Screen name="announcement" options={{ headerShown: true }} />

            <Stack.Screen name="approveRenew" options={{ headerShown: true }} />

          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
