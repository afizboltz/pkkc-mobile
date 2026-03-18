import DatePickerModal from '@/src/components/ui/DatePickerModal';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useTranslation } from '@/src/i18n';
import { printLog } from '@/src/utils/log';
import { mmkvAsyncStorage } from '@/src/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { registerUser } from '../src/services/auth';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

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

    const renderInput = (label: string, field: keyof typeof formData, options?: { 
        keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
        multiline?: boolean;
        placeholder?: string;
        secureTextEntry?: boolean;
    }) => {
        const isSecure = options?.secureTextEntry || false;
        const showPasswordToggle = field === 'password' || field === 'confirmPassword';
        const showPasswordValue = field === 'password' ? showPassword : showConfirmPassword;
        const togglePasswordVisibility = field === 'password' ? setShowPassword : setShowConfirmPassword;

        return (
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputWrapper}>
                    {!isSecure && (
                        <Ionicons name="document-text-outline" size={20} color={ColorPalette.gray[400]} style={styles.inputIcon} />
                    )}
                    {isSecure && (
                        <Ionicons name="lock-closed-outline" size={20} color={ColorPalette.gray[400]} style={styles.inputIcon} />
                    )}
                    <TextInput
                        style={[styles.input, options?.multiline && styles.textarea]}
                        placeholder={options?.placeholder || ''}
                        placeholderTextColor={ColorPalette.gray[400]}
                        value={formData[field] as string}
                        onChangeText={(value) => updateFormData(field, value)}
                        keyboardType={options?.keyboardType || 'default'}
                        autoCapitalize={field === 'email' ? 'none' : 'words'}
                        autoCorrect={false}
                        multiline={options?.multiline}
                        secureTextEntry={isSecure && !showPasswordValue}
                    />
                    {showPasswordToggle && (
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => togglePasswordVisibility(!showPasswordValue)}
                        >
                            <Ionicons
                                name={showPasswordValue ? 'eye-off' : 'eye'}
                                size={20}
                                color={ColorPalette.gray[500]}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderChipGroup = (label: string, field: keyof typeof formData, options: string[]) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.chipsRowWrap}>
                {options.map((opt) => (
                    <TouchableOpacity 
                        key={opt} 
                        style={[styles.chip, formData[field] === opt && styles.chipSelected]} 
                        onPress={() => updateFormData(field, opt)}
                    >
                        <Text style={[styles.chipText, formData[field] === opt && styles.chipTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View 
                        style={styles.header}
                        entering={FadeInDown.duration(500).springify()}
                    >
                        <View style={styles.logoContainer}>
                            <View style={styles.logoPlaceholder}>
                                <Ionicons name="person-add" size={36} color={ColorPalette.white} />
                            </View>
                        </View>
                        <Text style={styles.title}>{t('createAccountTitle')}</Text>
                        <Text style={styles.subtitle}>{t('joinCommunity')}</Text>
                    </Animated.View>

                    <Animated.View 
                        style={styles.form}
                        entering={FadeInUp.duration(500).delay(100).springify()}
                    >
                        <Card variant="elevated" padding="lg">
                            {renderInput(t('fullNameReq'), 'name', { placeholder: t('enterFullName') })}
                            {renderInput(t('No ic'), 'ic', { keyboardType: 'numeric', placeholder: t('enterIC') })}
                            {renderInput(t('emailAddressReq'), 'email', { keyboardType: 'email-address', placeholder: t('enterYourEmail') })}
                            
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>{t('phoneNumber')}</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="call-outline" size={20} color={ColorPalette.gray[400]} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('enterPhoneNumber')}
                                        placeholderTextColor={ColorPalette.gray[400]}
                                        value={formData.phone}
                                        onChangeText={(value) => updateFormData('phone', value)}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                                <Text style={styles.info}>{t('*sila pastikan nombor telefon ini mempunyai aplikasi Whatsapp')}</Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>{t('TARIKH LAHIR')}</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => setShowDobPicker(true)}
                                >
                                    <View style={styles.datePickerContent}>
                                        <Ionicons name="calendar-outline" size={20} color={formData.dob ? ColorPalette.gray[700] : ColorPalette.gray[400]} />
                                        <Text style={{ color: formData.dob ? ColorPalette.gray[700] : ColorPalette.gray[400], marginLeft: Spacing.sm }}>
                                            {formData.dob || t('DD/MM/YYYY')}
                                        </Text>
                                    </View>
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

                            {renderChipGroup(t('JANTINA'), 'gender', ['Lelaki', 'Perempuan'])}
                            {renderChipGroup(t('Status'), 'status', ['Bujang', 'Berkahwin', 'Duda', 'Janda', 'Balu', 'Lain-lain'])}
                            {renderChipGroup(t('TAMAN PERUMAHAN'), 'taman', ['Kita Ria', 'Kita Bayu', 'Kita Impian', 'Kita Sejati', 'Kita Mesra', 'Kita Harmoni', 'Kita Mekar', 'Kita Bestari'])}
                            
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>{t('ALAMAT PENUH')}</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={[styles.input, styles.textarea]}
                                        placeholder={t('Masukkan alamat penuh anda')}
                                        placeholderTextColor={ColorPalette.gray[400]}
                                        value={formData.address}
                                        onChangeText={(value) => updateFormData('address', value)}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>

                            {renderChipGroup(t('BILANGAN AHLI RUMAH'), 'household', ['1 - 2 orang', '3 - 5 orang', 'Lebih dari 5 orang'])}

                            {renderInput(t('PEKERJAAN'), 'occupation', { placeholder: t('Contoh: Jurutera, Peniaga, Pelajar') })}
                            
                            {renderInput(t('passwordReq'), 'password', { secureTextEntry: true, placeholder: t('createPassword') })}
                            {renderInput(t('confirmPasswordReq'), 'confirmPassword', { secureTextEntry: true, placeholder: t('confirmYourPassword') })}
                        </Card>

                        <AnimatedView entering={FadeInUp.duration(400).delay(200)}>
                            <Card variant="outlined" padding="md" style={styles.paymentCard}>
                                <View style={styles.paymentHeader}>
                                    <Ionicons name="wallet" size={24} color={ColorPalette.tertiary[500]} />
                                    <Text style={styles.paymentTitle}>{t('payRM10')}</Text>
                                </View>
                                <Text style={styles.paymentText}>{t('regFee')}</Text>
                                <Text style={styles.paymentText}>{t('memberFee')}</Text>
                                <Text style={styles.accountText}>{t('makePaymentTo')}</Text>
                            </Card>
                        </AnimatedView>

                        <AnimatedView entering={FadeInUp.duration(400).delay(300)}>
                            <Card variant="elevated" padding="md">
                                <Text style={styles.uploadLabel}>{t('uploadPaymentScreenshot')}</Text>
                                {imageUri ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                                        <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImageUri(null); updateFormData('receipt', ''); }}>
                                            <Ionicons name="close-circle" size={24} color={ColorPalette.error[500]} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                                        <Ionicons name="cloud-upload-outline" size={32} color={ColorPalette.primary[500]} />
                                        <Text style={styles.uploadText}>{t('pickScreenshot')}</Text>
                                    </TouchableOpacity>
                                )}
                            </Card>
                        </AnimatedView>

                        <AnimatedView entering={FadeInUp.duration(400).delay(400)}>
                            <TouchableOpacity 
                                onPress={() => updateFormData('ack', !formData.ack)} 
                                style={styles.ackRow}
                            >
                                <View style={[styles.checkbox, formData.ack && styles.checkboxChecked]}>
                                    {formData.ack && <Ionicons name="checkmark" size={16} color={ColorPalette.white} />}
                                </View>
                                <Text style={styles.ackText}>Saya mengaku bahawa segala keterangan yang diberikan adalah benar, dan saya akan mematuhi semua syarat serta peraturan persatuan, serta bersetuju bahawa data peribadi saya hanya untuk kegunaan Jawatankuasa Persatuan Komuniti Kita Cybersouth (PKKC) sahaja. Sebarang penggunaan lain tanpa kebenaran saya adalah tidak sah.</Text>
                            </TouchableOpacity>
                        </AnimatedView>

                        <AnimatedView entering={FadeInUp.duration(400).delay(500)}>
                            <Button 
                                variant="primary" 
                                size="lg" 
                                fullWidth 
                                loading={isLoading}
                                onPress={handleSignup}
                            >
                                {isLoading ? t('creatingAccount') : t('createAccount')}
                            </Button>
                        </AnimatedView>

                        <Animated.View 
                            style={styles.footer}
                            entering={FadeInUp.duration(400).delay(600)}
                        >
                            <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.linkText}>{t('signInLower')}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    logoContainer: {
        marginBottom: Spacing.md,
    },
    logoPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.xl,
        backgroundColor: ColorPalette.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.md,
    },
    title: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[500],
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        color: ColorPalette.gray[700],
        marginBottom: Spacing.xs,
    },
    info: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.gray[500],
        marginTop: Spacing.xs,
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
    textarea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    datePickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eyeButton: {
        padding: Spacing.md,
    },
    chipsRowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    chip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: ColorPalette.gray[300],
        backgroundColor: ColorPalette.gray[100],
    },
    chipSelected: {
        backgroundColor: ColorPalette.primary[500],
        borderColor: ColorPalette.primary[500],
    },
    chipText: {
        color: ColorPalette.gray[700],
        fontSize: Typography.fontSize.sm,
    },
    chipTextSelected: {
        color: ColorPalette.white,
    },
    paymentCard: {
        marginTop: Spacing.md,
        backgroundColor: ColorPalette.tertiary[50],
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    paymentTitle: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[900],
        marginLeft: Spacing.sm,
    },
    paymentText: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[600],
    },
    accountText: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[800],
        marginTop: Spacing.xs,
        fontWeight: Typography.fontWeight.medium,
    },
    uploadLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        color: ColorPalette.gray[700],
        marginBottom: Spacing.md,
    },
    imagePreviewContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: BorderRadius.lg,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -Spacing.sm,
        right: -Spacing.sm,
    },
    uploadButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: ColorPalette.primary[300],
        borderRadius: BorderRadius.lg,
        backgroundColor: ColorPalette.primary[50],
    },
    uploadText: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.primary[500],
        marginTop: Spacing.sm,
    },
    ackRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: Spacing.md,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: BorderRadius.sm,
        borderWidth: 2,
        borderColor: ColorPalette.gray[300],
        backgroundColor: ColorPalette.white,
        marginRight: Spacing.sm,
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: ColorPalette.primary[500],
        borderColor: ColorPalette.primary[500],
    },
    ackText: {
        flex: 1,
        color: ColorPalette.gray[600],
        fontSize: Typography.fontSize.xs,
        lineHeight: 18,
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
