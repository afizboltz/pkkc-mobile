import { useAuth } from '@/src/hooks/useAuth';
import { loginWithIcNo } from '@/src/services/auth';
import { printLog } from '@/src/utils/log';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTranslation } from '@/src/i18n';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function LoginScreen() {
  const { loading } = useAuth();

  const navigation = useNavigation();

  const [icNo, setIcNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

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
      navigation.reset({
        index: 0,
        routes: [{ name: "dashboard" } as any],
      })
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <Animated.View 
            style={styles.header}
            entering={FadeInDown.duration(600).springify()}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Ionicons name="people" size={48} color={ColorPalette.white} />
              </View>
            </View>
            <Text style={styles.title}>{t('welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('signInToAccount')}</Text>
          </Animated.View>

          <Animated.View 
            style={styles.form}
            entering={FadeInUp.duration(600).delay(200).springify()}
          >
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

            <Animated.View style={buttonAnimatedStyle}>
              <AnimatedTouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={loading}
                entering={FadeInUp.duration(400).delay(400)}
              >
                {loading ? (
                  <ActivityIndicator color={ColorPalette.white} />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>{t('signIn')}</Text>
                    <Ionicons name="arrow-forward" size={20} color={ColorPalette.white} />
                  </>
                )}
              </AnimatedTouchableOpacity>
            </Animated.View>

            <Animated.View 
              style={styles.footer}
              entering={FadeInUp.duration(400).delay(500)}
            >
              <Text style={styles.footerText}>{t('dontHaveAccount')}</Text>
              <TouchableOpacity onPress={() => { navigation.navigate('signup' as never) }}>
                <Text style={styles.linkText}>{t('signUp')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
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
