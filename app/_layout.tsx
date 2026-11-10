import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/src/contexts/AuthContext";
import { GuestProvider } from "@/src/contexts/GuestContext";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { TranslationProvider, useTranslation } from "@/src/i18n";
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

  const Screens = () => {
    const { t } = useTranslation();
    const ENVIdentifier = () => {
      return (
        <View style={{ backgroundColor: "yellow", height: 30, alignItems: "center", justifyContent: "center" }}>
          <Text>{t('env')}: {process.env.EXPO_PUBLIC_ENV}</Text>
        </View>
      );
    };
    return (
      <>
        <ENVIdentifier />
        <Stack screenOptions={{
          headerBackTitle: ''
        }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="preLogin" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: true, title: t('signUp'), headerBackTitle: '' }} />
          <Stack.Screen name="pending" options={{ headerShown: true, title: t('pendingApproval') }} />
          <Stack.Screen name="rejected" options={{ headerShown: true, title: t('rejectedScreenTitle') }} />
          <Stack.Screen name="verifyAndSetPassword" options={{ headerShown: true, title: t('verifySetPasswordTitle') }} />
          <Stack.Screen name="+not-found" />

          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="renewMembership" options={{ headerShown: true, title: t('renewMembership') }} />
          <Stack.Screen name="changePassword" options={{ headerShown: true, title: t('changePassword') }} />
          <Stack.Screen name="direktoriPeniaga" options={{ headerShown: true, title: t('direktoriPeniaga') }} />
          <Stack.Screen name="keahlian" options={{ headerShown: true, title: t('keahlian') }} />
          <Stack.Screen name="bancian" options={{ headerShown: true, title: t('bancian') }} />
          <Stack.Screen name="dokumen" options={{ headerShown: true, title: t('dokumen') }} />
          <Stack.Screen name="notifikasi" options={{ headerShown: true, title: t('notifikasi') }} />
          <Stack.Screen name="announcement" options={{ headerShown: true, title: t('announcements'), headerBackTitleVisible: false }} />

          <Stack.Screen name="approveRenew" options={{ headerShown: true, title: t('approveRenewal') }} />
          <Stack.Screen name="approveNewUser" options={{ headerShown: true, title: t('approveNewUser') }} />
          <Stack.Screen name="userList" options={{ headerShown: true, title: t('userList') }} />
          <Stack.Screen name="renewUserList" options={{ headerShown: true, title: t('renewUserList') }} />
          <Stack.Screen name="organisation" options={{ headerShown: true, title: 'Organisasi PKKC' }} />
          <Stack.Screen name="directory" options={{ headerShown: true, title: 'Direktori' }} />

          <Stack.Screen name="agm" options={{ headerShown: true, title: t('agm') }} />
          <Stack.Screen name="agmRegister" options={{ headerShown: true, title: t('agmRegisterNow') }} />
          <Stack.Screen name="agmDocuments" options={{ headerShown: true, title: t('agmViewDocuments') }} />
          <Stack.Screen name="agmVoting" options={{ headerShown: true, title: t('agmGoToVoting') }} />
          <Stack.Screen name="agmAdmin" options={{ headerShown: true, title: t('agmAdmin') }} />
          <Stack.Screen name="agmAdminCodes" options={{ headerShown: true, title: t('agmGenerateCodesTitle') }} />
          <Stack.Screen name="agmAdminDocuments" options={{ headerShown: true, title: t('agmUploadDocumentTitle') }} />
          <Stack.Screen name="agmAdminResolutions" options={{ headerShown: true, title: t('agmAddResolutionTitle') }} />
        </Stack>
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <GuestProvider>
            <TranslationProvider>
              <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                <Screens />
                <StatusBar style="auto" />
              </ThemeProvider>
            </TranslationProvider>
          </GuestProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
