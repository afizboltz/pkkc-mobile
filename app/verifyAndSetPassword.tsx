import { selfVerifyAndSetPassword } from '@/src/services/auth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTranslation } from '@/src/i18n';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';

export default function VerifyAndSetPasswordScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [icNo, setIcNo] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!icNo.trim() || !email.trim() || !newPassword || !confirmPassword) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsNotMatch'));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t('error'), t('passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const result = await selfVerifyAndSetPassword(icNo, email, newPassword);
      if (result.outcome === 'ok') {
        Alert.alert(t('success'), t('verifySuccess'));
        navigation.reset({ index: 0, routes: [{ name: 'dashboard' } as any] });
        return;
      }
      if (result.outcome === 'throttled') {
        Alert.alert(t('error'), t('verifyThrottled'));
        return;
      }
      Alert.alert(t('error'), t('verifyFailedGeneric'));
    } catch (e: any) {
      Alert.alert(t('error'), t('verifyFailedGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ColorPalette.gray[50] }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl }}>
          <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
            <View style={{
              width: 72, height: 72, borderRadius: BorderRadius.xl,
              backgroundColor: ColorPalette.primary[500], alignItems: 'center', justifyContent: 'center',
              marginBottom: Spacing.md, ...Shadow.lg,
            }}>
              <Ionicons name="key-outline" size={36} color={ColorPalette.white} />
            </View>
            <Text style={{ fontSize: Typography.fontSize.xxl, fontWeight: Typography.fontWeight.bold, color: ColorPalette.gray[900], textAlign: 'center' }}>
              {t('verifySetPasswordTitle')}
            </Text>
            <Text style={{ fontSize: Typography.fontSize.base, color: ColorPalette.gray[500], textAlign: 'center', marginTop: Spacing.xs }}>
              {t('verifySetPasswordSubtitle')}
            </Text>
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{ fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium, color: ColorPalette.gray[700], marginBottom: Spacing.xs }}>
              {t('icNo')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: ColorPalette.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: ColorPalette.gray[200], ...Shadow.sm }}>
              <Ionicons name="card-outline" size={20} color={ColorPalette.gray[400]} style={{ paddingHorizontal: Spacing.md }} />
              <TextInput
                style={{ flex: 1, paddingVertical: Spacing.md, paddingRight: Spacing.md, fontSize: Typography.fontSize.base, color: ColorPalette.gray[900] }}
                placeholder={t('enterYourIcNo')}
                placeholderTextColor={ColorPalette.gray[400]}
                value={icNo}
                onChangeText={setIcNo}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{ fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium, color: ColorPalette.gray[700], marginBottom: Spacing.xs }}>
              {t('emailAddress')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: ColorPalette.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: ColorPalette.gray[200], ...Shadow.sm }}>
              <Ionicons name="mail-outline" size={20} color={ColorPalette.gray[400]} style={{ paddingHorizontal: Spacing.md }} />
              <TextInput
                style={{ flex: 1, paddingVertical: Spacing.md, paddingRight: Spacing.md, fontSize: Typography.fontSize.base, color: ColorPalette.gray[900] }}
                placeholder={t('enterYourEmail')}
                placeholderTextColor={ColorPalette.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={{ marginBottom: Spacing.lg }}>
            <Text style={{ fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium, color: ColorPalette.gray[700], marginBottom: Spacing.xs }}>
              {t('newPasswordLabel')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: ColorPalette.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: ColorPalette.gray[200], ...Shadow.sm }}>
              <Ionicons name="lock-closed-outline" size={20} color={ColorPalette.gray[400]} style={{ paddingHorizontal: Spacing.md }} />
              <TextInput
                style={{ flex: 1, paddingVertical: Spacing.md, paddingRight: Spacing.xs, fontSize: Typography.fontSize.base, color: ColorPalette.gray[900] }}
                placeholder={t('enterNewPassword')}
                placeholderTextColor={ColorPalette.gray[400]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={{ padding: Spacing.md }} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={ColorPalette.gray[500]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: Spacing.xl }}>
            <Text style={{ fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium, color: ColorPalette.gray[700], marginBottom: Spacing.xs }}>
              {t('confirmNewPasswordLabel')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: ColorPalette.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: ColorPalette.gray[200], ...Shadow.sm }}>
              <Ionicons name="lock-closed-outline" size={20} color={ColorPalette.gray[400]} style={{ paddingHorizontal: Spacing.md }} />
              <TextInput
                style={{ flex: 1, paddingVertical: Spacing.md, paddingRight: Spacing.md, fontSize: Typography.fontSize.base, color: ColorPalette.gray[900] }}
                placeholder={t('confirmNewPasswordLabel')}
                placeholderTextColor={ColorPalette.gray[400]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: ColorPalette.primary[500], paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
              alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing.sm, ...Shadow.md,
              opacity: loading ? 0.6 : 1,
            }}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={ColorPalette.white} />
            ) : (
              <>
                <Text style={{ fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.semibold, color: ColorPalette.white }}>
                  {t('verifyAndSetPasswordButton')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={ColorPalette.white} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
