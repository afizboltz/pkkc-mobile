import { useTranslation } from '@/src/i18n';
import { printLog } from '@/src/utils/log';
import { mmkvAsyncStorage } from '@/src/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Button,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { registerUser } from '../src/services/auth';

export default function SignupScreen() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        receipt: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const navigation = useNavigation();
    const { t } = useTranslation();

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(t('permissionRequired'), t('needPhotoPermission'));
            return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
            // Fallback to deprecated API to match current installed types
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!res.canceled) {
            setImageUri(res.assets[0].uri);
            updateFormData('receipt', res.assets[0].uri)
        }
    };

    const handleSignup = async () => {
        setIsLoading(true);

        const { name, email, phone, password, confirmPassword, receipt } = formData;

        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !receipt.trim()) {
            setIsLoading(false);
            Alert.alert(t('error'), t('requiredFields'));
            return;
        }

        if (password !== confirmPassword) {
            setIsLoading(false);
            Alert.alert(t('error'), t('passwordsNotMatch'));
            return;
        }

        if (password.length < 6) {
            setIsLoading(false);
            Alert.alert(t('error'), t('passwordTooShort'));
            return;
        }

        if (!receipt) {
            setIsLoading(false);
            Alert.alert(t('error'), t('pleaseUploadReceipt'));
            return;
        }

        try {
            const res = await registerUser(email, password, receipt);
            printLog('SignupScreen', res);

            if (res.status === "success") {
                // Persist signup email for later status checks
                await mmkvAsyncStorage.setItem('signupEmail', email.trim().toLowerCase());
                navigation.navigate("pending" as never);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            printLog('SignupScreen ERR', error.message)
            Alert.alert(t('error'), error.message || t('failedCreateAccount'));
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('createAccountTitle')}</Text>
                        <Text style={styles.subtitle}>{t('joinCommunity')}</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('fullNameReq')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterFullName')}
                                value={formData.name}
                                onChangeText={(value) => updateFormData('name', value)}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('emailAddressReq')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterYourEmail')}
                                value={formData.email}
                                onChangeText={(value) => updateFormData('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('phoneNumber')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterPhoneNumber')}
                                value={formData.phone}
                                onChangeText={(value) => updateFormData('phone', value)}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('passwordReq')}</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder={t('createPassword')}
                                    value={formData.password}
                                    onChangeText={(value) => updateFormData('password', value)}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('confirmPasswordReq')}</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder={t('confirmYourPassword')}
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <Text style={styles.feeText}>{t('payRM10')}</Text>
                            <Text>{t('regFee')}</Text>
                            <Text>{t('memberFee')}</Text>
                            <Text style={styles.accountText}>{t('makePaymentTo')}</Text>
                        </View>

                        {imageUri ? <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginVertical: 12 }} /> : <View style={{ height: 50 }} />}

                        <Button title={t('pickScreenshot')} onPress={pickImage} />
                        <Text style={styles.imageHint}>{t('uploadPaymentScreenshot')}</Text>

                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            <Text style={styles.signupButtonText}>
                                {isLoading ? t('creatingAccount') : t('createAccount')}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>

                            <TouchableOpacity>
                                <Text style={styles.linkText}>{t('signInLower')}</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 32,
        paddingTop: 20,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 32,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 8,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    eyeButton: {
        padding: 16,
    },
    signupButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    signupButtonDisabled: {
        opacity: 0.6,
    },
    signupButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 16,
        color: '#6B7280',
    },
    linkText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3B82F6',
    },
    feeText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
    accountText: {
        fontSize: 14,
        color: '#374151',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500',
    },
    imageHint: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
});