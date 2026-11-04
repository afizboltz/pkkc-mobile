import { changePassword } from '@/src/services/auth';
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

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
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
      await changePassword(newPassword);
      Alert.alert(t('success'), t('changePasswordSuccess'));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('error'), t('changePasswordFailed'));
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
              <Text style={{ fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.semibold, color: ColorPalette.white }}>
                {t('changePassword')}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
