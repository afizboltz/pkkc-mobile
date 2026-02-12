import DatePickerModal from '@/src/components/ui/DatePickerModal';
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
        receipt: '',
        ic: '',
        dob: '',
        gender: '',
        status: '',
        taman: '',
        address: '',
        household: '',
        occupation: '',
        ack: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [dobDate, setDobDate] = useState<Date | null>(null);
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

    const isEmpty = (v: any) => typeof v === 'string' ? v.trim().length === 0 : !v;

    const handleSignup = async () => {
        setIsLoading(true);

        const { name, email, phone, password, confirmPassword, receipt, ic, dob, gender, status, taman, address, household, occupation, ack } = formData;

        const fieldLabels: Record<string, string> = {
            name: t('fullNameReq'),
            email: t('emailAddressReq'),
            phone: t('phoneNumber'),
            password: t('passwordReq'),
            confirmPassword: t('confirmPasswordReq'),
            receipt: t('uploadPaymentScreenshot'),
            ic: t('No ic'),
            dob: t('TARIKH LAHIR'),
            gender: t('JANTINA'),
            status: t('Status'),
            taman: t('TAMAN PERUMAHAN'),
            address: t('ALAMAT PENUH'),
            household: t('BILANGAN AHLI RUMAH'),
            occupation: t('PEKERJAAN'),
        };

        const missing: string[] = [];
        (Object.keys(fieldLabels) as Array<keyof typeof fieldLabels>).forEach((key) => {
            const value = (formData as any)[key];
            if (isEmpty(value)) missing.push(fieldLabels[key]);
        });

        if (missing.length > 0) {
            setIsLoading(false);
            Alert.alert(t('error'), `${t('requiredFields')}\n\n${missing.map((m, i) => `${i + 1}. ${m}`).join('\n')}`);
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

        if (!ack) {
            setIsLoading(false);
            Alert.alert(t('error'), t('pleaseAcknowledge'));
            return;
        }

        try {
            const res = await registerUser(email, password, receipt, {
                name,
                phone,
                ic,
                dob,
                gender,
                status,
                taman,
                address,
                household,
                occupation,
                ack,
            });
            printLog('SignupScreen', res);

            if (res.status === "success") {
                // Persist signup email for later status checks
                await mmkvAsyncStorage.setItem('signupEmail', email.trim().toLowerCase());
                navigation.reset({
                    index: 0,
                    routes: [{ name: "pending" as never }],
                });
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            printLog('SignupScreen ERR', error.message)
            Alert.alert(t('error'), error.message || t('failedCreateAccount'));
        }
    };

    const updateFormData = (field: string, value: any) => {
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
                            <Text style={styles.label}>{t('No ic')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterIC')}
                                value={formData.ic}
                                onChangeText={(value) => updateFormData('ic', value)}
                                keyboardType='numeric'
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
                            <Text style={styles.info}>{t('*sila pastikan nombor telefon ini mempunyai aplikasi Whatsapp')}</Text>
                            <Text style={styles.info}>{t('*hanya nombor ini sahaja akan di approve oleh admin ke dalam group ahli')}</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('TARIKH LAHIR')}</Text>
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowDobPicker(true)}
                            >
                                <Text style={{ color: formData.dob ? '#1F2937' : '#9CA3AF' }}>
                                    {formData.dob || t('DD/MM/YYYY')}
                                </Text>
                            </TouchableOpacity>
                            <DatePickerModal
                                visible={showDobPicker}
                                initialDate={dobDate || new Date(1990, 0, 1)}
                                mode="date"
                                title={t('TARIKH LAHIR')}
                                cancelText={t('cancel')}
                                confirmText={t('ok')}
                                onCancel={() => setShowDobPicker(false)}
                                onConfirm={(selectedDate) => {
                                    setDobDate(selectedDate);
                                    const dd = String(selectedDate.getDate()).padStart(2, '0');
                                    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                    const yyyy = selectedDate.getFullYear();
                                    updateFormData('dob', `${dd}/${mm}/${yyyy}`);
                                    setShowDobPicker(false);
                                }}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('JANTINA')}</Text>
                            <View style={styles.chipsRow}>
                                {['Lelaki', 'Perempuan'].map(opt => (
                                    <TouchableOpacity key={opt} style={[styles.chip, formData.gender === opt && styles.chipSelected]} onPress={() => updateFormData('gender', opt)}>
                                        <Text style={[styles.chipText, formData.gender === opt && styles.chipTextSelected]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('Status')}</Text>
                            <View style={styles.chipsRowWrap}>
                                {['Bujang', 'Berkahwin', 'Duda', 'Janda', 'Balu', 'Lain-lain'].map(opt => (
                                    <TouchableOpacity key={opt} style={[styles.chip, formData.status === opt && styles.chipSelected]} onPress={() => updateFormData('status', opt)}>
                                        <Text style={[styles.chipText, formData.status === opt && styles.chipTextSelected]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('TAMAN PERUMAHAN')}</Text>
                            <View style={styles.chipsRowWrap}>
                                {['Kita Ria', 'Kita Bayu', 'Kita Impian', 'Kita Sejati', 'Kita Mesra', 'Kita Harmoni', 'Kita Mekar', 'Kita Bestari'].map(opt => (
                                    <TouchableOpacity key={opt} style={[styles.chip, formData.taman === opt && styles.chipSelected]} onPress={() => updateFormData('taman', opt)}>
                                        <Text style={[styles.chipText, formData.taman === opt && styles.chipTextSelected]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('ALAMAT PENUH')}</Text>
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                placeholder={t('Masukkan alamat penuh anda')}
                                value={formData.address}
                                onChangeText={(value) => updateFormData('address', value)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('BILANGAN AHLI RUMAH')}</Text>
                            <View style={styles.chipsRowWrap}>
                                {['1 - 2 orang', '3 - 5 orang', 'Lebih dari 5 orang'].map(opt => (
                                    <TouchableOpacity key={opt} style={[styles.chip, formData.household === opt && styles.chipSelected]} onPress={() => updateFormData('household', opt)}>
                                        <Text style={[styles.chipText, formData.household === opt && styles.chipTextSelected]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('PEKERJAAN')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('Contoh: Jurutera, Peniaga, Pelajar')}
                                value={formData.occupation}
                                onChangeText={(value) => updateFormData('occupation', value)}
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

                        <View style={[styles.inputContainer, { marginTop: 4 }]}>
                            <TouchableOpacity onPress={() => updateFormData('ack', !formData.ack)} style={styles.ackRow}>
                                <View style={[styles.checkbox, formData.ack && styles.checkboxChecked]} />
                                <Text style={styles.ackText}>Saya mengaku bahawa segala keterangan yang diberikan adalah benar, dan saya akan mematuhi semua syarat serta peraturan persatuan, serta bersetuju bahawa data peribadi saya hanya untuk kegunaan Jawatankuasa Persatuan Komuniti Kita Cybersouth (PKKC) sahaja. Sebarang penggunaan lain tanpa kebenaran saya adalah tidak sah.</Text>
                            </TouchableOpacity>
                        </View>

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
    info: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
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
    chipsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chipsRowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        marginBottom: 8,
    },
    chipSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    chipText: {
        color: '#374151',
        fontSize: 14,
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    textarea: {
        minHeight: 120,
    },
    ackRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        marginRight: 12,
        marginTop: 'auto',
        marginBottom: 'auto'
    },
    checkboxChecked: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    ackText: {
        flex: 1,
        color: '#374151',
        fontSize: 12,
    },
});