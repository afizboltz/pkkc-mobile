import { useAuth } from '@/src/hooks/useAuth';
import { KeyboardDismissView } from '@/src/components/KeyboardDismissView';
import { getAppSetting } from '@/src/services/appSettings';
import { getPostAuthRouteName, getUserProfile, loginWithIcNo } from '@/src/services/auth';
import { printLog } from '@/src/utils/log';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTranslation } from '@/src/i18n';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';


export default function LoginScreen() {
  const { loading } = useAuth();

  const navigation = useNavigation();

  const [icNo, setIcNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bootstrapEnabled, setBootstrapEnabled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    getAppSetting<boolean>('bootstrap_verify_enabled', false).then(setBootstrapEnabled);
  }, []);

  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleLogin = async () => {
    if (!icNo.trim() || !password.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    try {
      const res = await loginWithIcNo(icNo, password);
      printLog('LoginScreen', res);
      // Route by the account's real status (pending/active/rejected), not straight to the
      // dashboard — AuthContext's own background hydration from the SIGNED_IN event isn't
      // guaranteed to have landed yet, so this fetches the profile directly to decide.
      const profile = res.user ? await getUserProfile(res.user.id) : null;
      router.replace(`/${getPostAuthRouteName(profile)}` as any);
    } catch (error: any) {
      Alert.alert(t('error'), t('failedSignIn'));
    }
  };

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardDismissView style={styles.keyboardAvoid}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Ionicons name="people" size={48} color={ColorPalette.white} />
              </View>
            </View>
            <Text style={styles.title}>{t('welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('signInToAccount')}</Text>
          </View>

          <View style={styles.form}>
            {bootstrapEnabled && (
              <TouchableOpacity
                style={styles.bootstrapCta}
                onPress={() => navigation.navigate('verifyAndSetPassword' as never)}
              >
                <Ionicons name="key-outline" size={22} color={ColorPalette.primary[600]} />
                <View style={styles.bootstrapCtaTextContainer}>
                  <Text style={styles.bootstrapCtaTitle}>{t('bootstrapCtaTitle')}</Text>
                  <Text style={styles.bootstrapCtaSubtitle}>{t('bootstrapCtaSubtitle')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={ColorPalette.primary[500]} />
              </TouchableOpacity>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('icNo')}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={20} color={ColorPalette.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('passwordLabel')}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={ColorPalette.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t('enterYourPassword')}
                  placeholderTextColor={ColorPalette.gray[400]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={ColorPalette.gray[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => navigation.navigate('verifyAndSetPassword' as never)}
            >
              <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
            </TouchableOpacity>

            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={ColorPalette.white} />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>{t('signIn')}</Text>
                    <Ionicons name="arrow-forward" size={20} color={ColorPalette.white} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('dontHaveAccount')}</Text>
              <TouchableOpacity onPress={() => { navigation.navigate('signup' as never) }}>
                <Text style={styles.linkText}>{t('signUp')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardDismissView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: ColorPalette.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: ColorPalette.gray[900],
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[500],
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: ColorPalette.gray[700],
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: ColorPalette.gray[200],
    ...Shadow.sm,
  },
  inputIcon: {
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[900],
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.xs,
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[900],
  },
  eyeButton: {
    padding: Spacing.md,
  },
  bootstrapCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.primary[50],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: ColorPalette.primary[100],
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  bootstrapCtaTextContainer: {
    flex: 1,
  },
  bootstrapCtaTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.primary[700],
  },
  bootstrapCtaSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: ColorPalette.primary[600],
    marginTop: 2,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.sm,
    color: ColorPalette.primary[500],
    fontWeight: Typography.fontWeight.medium,
  },
  loginButton: {
    backgroundColor: ColorPalette.primary[500],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    ...Shadow.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: Typography.fontSize.base,
    color: ColorPalette.gray[500],
  },
  linkText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: ColorPalette.primary[500],
  },
});
