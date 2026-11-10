import { KeyboardDismissView } from '@/src/components/KeyboardDismissView';
import DatePickerModal from '@/src/components/ui/DatePickerModal';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { StepProgress } from '@/src/components/ui/StepProgress';
import { TextInput } from '@/src/components/ui/TextInput';
import { useTranslation } from '@/src/i18n';
import { printLog } from '@/src/utils/log';
import { mmkvAsyncStorage } from '@/src/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { router, useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Keyboard,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { registerUser } from '../src/services/auth';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';

type FormData = {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    receipt: string;
    ic: string;
    dob: string;
    gender: string;
    status: string;
    taman: string;
    address: string;
    household: string;
    occupation: string;
    ack: boolean;
};

const STEP_FIELDS: Array<Array<keyof FormData>> = [
    ['name', 'ic', 'email', 'phone', 'dob', 'gender'],
    ['status', 'taman', 'address', 'household', 'occupation'],
    ['password', 'confirmPassword'],
];

export default function SignupScreen() {
    const [formData, setFormData] = useState<FormData>({
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
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [dobDate, setDobDate] = useState<Date | null>(null);
    const navigation = useNavigation();
    const { t } = useTranslation();

    const isEmpty = (v: any) => typeof v === 'string' ? v.trim().length === 0 : !v;

    const validateField = (field: keyof FormData, value: any): string => {
        switch (field) {
            case 'name':
            case 'phone':
            case 'dob':
            case 'gender':
            case 'status':
            case 'taman':
            case 'address':
            case 'household':
            case 'occupation':
                return isEmpty(value) ? t('fieldRequired') : '';
            case 'ic':
                if (isEmpty(value)) return t('fieldRequired');
                return String(value).replace(/\D/g, '').length === 12 ? '' : t('invalidIcNo');
            case 'email':
                if (isEmpty(value)) return t('fieldRequired');
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : t('invalidEmail');
            case 'password':
                if (isEmpty(value)) return t('fieldRequired');
                return value.length >= 6 ? '' : t('passwordTooShort');
            case 'confirmPassword':
                if (isEmpty(value)) return t('fieldRequired');
                return value === formData.password ? '' : t('passwordsNotMatch');
            default:
                return '';
        }
    };

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFieldChange = (field: keyof FormData, value: any) => {
        updateFormData(field, value);
        setErrors(prev => (prev[field] ? { ...prev, [field]: validateField(field, value) } : prev));
    };

    const handleFieldBlur = (field: keyof FormData) => {
        setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }));
    };

    const validateStep = (stepIndex: number): boolean => {
        const fields = STEP_FIELDS[stepIndex];
        const newErrors: Partial<Record<keyof FormData, string>> = { ...errors };
        let hasError = false;
        fields.forEach((f) => {
            const err = validateField(f, formData[f]);
            newErrors[f] = err;
            if (err) hasError = true;
        });
        setErrors(newErrors);
        return !hasError;
    };

    const goNext = () => {
        if (!validateStep(step)) return;
        setStep((s) => Math.min(s + 1, STEP_FIELDS.length - 1));
    };

    const goBack = () => setStep((s) => Math.max(s - 1, 0));

    const requestGalleryImage = async () => {
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
            updateFormData('receipt', res.assets[0].uri);
        }
    };

    const requestCameraImage = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(t('permissionRequired'), t('needCameraPermission'));
            return;
        }
        const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!res.canceled) {
            setImageUri(res.assets[0].uri);
            updateFormData('receipt', res.assets[0].uri);
        }
    };

    const handleSignup = async () => {
        if (!validateStep(2)) return;

        if (!formData.receipt) {
            Alert.alert(t('error'), t('pleaseUploadReceipt'));
            return;
        }

        if (!formData.ack) {
            Alert.alert(t('error'), t('pleaseAcknowledge'));
            return;
        }

        setIsLoading(true);

        const { name, email, phone, password, receipt, ic, dob, gender, status, taman, address, household, occupation, ack } = formData;

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
                router.replace('/pending');
            } else if (res.status === "pending_email_confirmation") {
                Alert.alert(t('success'), t('pleaseCheckEmailToConfirm') || 'Please check your email to confirm your account, then sign in.');
                navigation.goBack();
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            printLog('SignupScreen ERR', error.message);
            Alert.alert(t('error'), t('failedCreateAccount'));
        }
    };

    const renderField = (field: keyof FormData, label: string, options?: {
        keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
        multiline?: boolean;
        placeholder?: string;
        secureTextEntry?: boolean;
        returnKeyType?: 'done' | 'next';
        onSubmitEditing?: () => void;
    }) => {
        const isSecure = options?.secureTextEntry || false;
        const showPasswordToggle = field === 'password' || field === 'confirmPassword';
        const showPasswordValue = field === 'password' ? showPassword : showConfirmPassword;
        const togglePasswordVisibility = field === 'password' ? setShowPassword : setShowConfirmPassword;

        return (
            <TextInput
                label={label}
                value={formData[field] as string}
                onChangeText={(value) => handleFieldChange(field, value)}
                onBlur={() => handleFieldBlur(field)}
                error={errors[field]}
                placeholder={options?.placeholder || ''}
                keyboardType={options?.keyboardType || 'default'}
                autoCapitalize={field === 'email' ? 'none' : 'sentences'}
                autoCorrect={false}
                multiline={options?.multiline}
                secureTextEntry={isSecure && !showPasswordValue}
                returnKeyType={options?.returnKeyType}
                onSubmitEditing={options?.onSubmitEditing}
                rightIcon={showPasswordToggle ? (
                    <TouchableOpacity onPress={() => togglePasswordVisibility(!showPasswordValue)}>
                        <Ionicons
                            name={showPasswordValue ? 'eye-off' : 'eye'}
                            size={20}
                            color={ColorPalette.gray[500]}
                        />
                    </TouchableOpacity>
                ) : undefined}
                containerStyle={styles.inputContainer}
            />
        );
    };

    const renderChipGroup = (label: string, field: keyof FormData, options: string[]) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.chipsRowWrap}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.chip, formData[field] === opt && styles.chipSelected]}
                        onPress={() => handleFieldChange(field, opt)}
                    >
                        <Text style={[styles.chipText, formData[field] === opt && styles.chipTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {errors[field] ? <Text style={styles.fieldErrorText}>{errors[field]}</Text> : null}
        </View>
    );

    const stepTitles = [t('stepPersonalInfoTitle'), t('stepHouseholdTitle'), t('stepAccountPaymentTitle')];

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardDismissView style={styles.keyboardAvoid}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                >
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoPlaceholder}>
                                <Ionicons name="person-add" size={36} color={ColorPalette.white} />
                            </View>
                        </View>
                        <Text style={styles.title}>{t('createAccountTitle')}</Text>
                        <Text style={styles.subtitle}>{t('joinCommunity')}</Text>
                    </View>

                    <StepProgress
                        currentStep={step}
                        totalSteps={STEP_FIELDS.length}
                        stepLabel={stepTitles[step]}
                        stepText={t('step')}
                        ofText={t('of')}
                    />

                    <View style={styles.form}>
                        {step === 0 && (
                            <Card variant="elevated" padding="lg">
                                {renderField('name', t('fullNameReq'), { placeholder: t('enterFullName') })}
                                {renderField('ic', t('icNo'), { keyboardType: 'numeric', placeholder: t('enterYourIcNo') })}
                                {renderField('email', t('emailAddressReq'), { keyboardType: 'email-address', placeholder: t('enterYourEmail') })}
                                {renderField('phone', t('phoneNumber'), { keyboardType: 'phone-pad', placeholder: t('enterPhoneNumber') })}
                                <Text style={styles.info}>{t('phoneWhatsappHint')}</Text>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>{t('dobLabel')}</Text>
                                    <TouchableOpacity
                                        style={[styles.input, errors.dob && styles.inputError]}
                                        onPress={() => setShowDobPicker(true)}
                                    >
                                        <View style={styles.datePickerContent}>
                                            <Ionicons name="calendar-outline" size={20} color={formData.dob ? ColorPalette.gray[700] : ColorPalette.gray[400]} />
                                            <Text style={{ color: formData.dob ? ColorPalette.gray[700] : ColorPalette.gray[400], marginLeft: Spacing.sm }}>
                                                {formData.dob || t('ddmmyyyyPlaceholder')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    {errors.dob ? <Text style={styles.fieldErrorText}>{errors.dob}</Text> : null}
                                    <DatePickerModal
                                        visible={showDobPicker}
                                        initialDate={dobDate || new Date(1990, 0, 1)}
                                        mode="date"
                                        title={t('dobLabel')}
                                        cancelText={t('cancel')}
                                        confirmText={t('ok')}
                                        onCancel={() => setShowDobPicker(false)}
                                        onConfirm={(selectedDate) => {
                                            setDobDate(selectedDate);
                                            const dd = String(selectedDate.getDate()).padStart(2, '0');
                                            const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                            const yyyy = selectedDate.getFullYear();
                                            handleFieldChange('dob', `${dd}/${mm}/${yyyy}`);
                                            setShowDobPicker(false);
                                        }}
                                    />
                                </View>

                                {renderChipGroup(t('genderLabel'), 'gender', ['Lelaki', 'Perempuan'])}
                            </Card>
                        )}

                        {step === 1 && (
                            <Card variant="elevated" padding="lg">
                                {renderChipGroup(t('maritalStatusLabel'), 'status', ['Bujang', 'Berkahwin', 'Duda', 'Janda', 'Balu', 'Lain-lain'])}
                                {renderChipGroup(t('tamanLabel'), 'taman', ['Kita Ria', 'Kita Bayu', 'Kita Impian', 'Kita Sejati', 'Kita Mesra', 'Kita Harmoni', 'Kita Mekar', 'Kita Bestari'])}
                                {renderField('address', t('addressLabel'), { multiline: true, placeholder: t('addressPlaceholder') })}
                                {renderChipGroup(t('householdLabel'), 'household', ['1 - 2 orang', '3 - 5 orang', 'Lebih dari 5 orang'])}
                                {renderField('occupation', t('occupationLabel'), { placeholder: t('occupationPlaceholder') })}
                            </Card>
                        )}

                        {step === 2 && (
                            <>
                                <Card variant="elevated" padding="lg">
                                    {renderField('password', t('passwordReq'), { secureTextEntry: true, placeholder: t('createPassword') })}
                                    {renderField('confirmPassword', t('confirmPasswordReq'), {
                                        secureTextEntry: true,
                                        placeholder: t('confirmYourPassword'),
                                        returnKeyType: 'done',
                                        onSubmitEditing: () => Keyboard.dismiss(),
                                    })}
                                </Card>

                                <View>
                                    <Card variant="outlined" padding="md" style={styles.paymentCard}>
                                        <View style={styles.paymentHeader}>
                                            <Ionicons name="wallet" size={24} color={ColorPalette.tertiary[500]} />
                                            <Text style={styles.paymentTitle}>{t('payRM10')}</Text>
                                        </View>
                                        <Text style={styles.paymentText}>{t('regFee')}</Text>
                                        <Text style={styles.paymentText}>{t('memberFee')}</Text>
                                        <Text style={styles.accountText}>{t('makePaymentTo')}</Text>
                                    </Card>
                                </View>

                                <View>
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
                                            <View style={styles.uploadRow}>
                                                <TouchableOpacity style={[styles.uploadButton, styles.uploadButtonHalf]} onPress={requestCameraImage}>
                                                    <Ionicons name="camera-outline" size={28} color={ColorPalette.primary[500]} />
                                                    <Text style={styles.uploadText}>{t('takePhoto')}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.uploadButton, styles.uploadButtonHalf]} onPress={requestGalleryImage}>
                                                    <Ionicons name="cloud-upload-outline" size={28} color={ColorPalette.primary[500]} />
                                                    <Text style={styles.uploadText}>{t('chooseFromGallery')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </Card>
                                </View>

                                <View>
                                    <TouchableOpacity
                                        onPress={() => updateFormData('ack', !formData.ack)}
                                        style={styles.ackRow}
                                    >
                                        <View style={[styles.checkbox, formData.ack && styles.checkboxChecked]}>
                                            {formData.ack && <Ionicons name="checkmark" size={16} color={ColorPalette.white} />}
                                        </View>
                                        <Text style={styles.ackText}>{t('ackAgreementText')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        <View style={styles.navRow}>
                            {step > 0 && (
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onPress={goBack}
                                    style={styles.navButton}
                                >
                                    {t('back')}
                                </Button>
                            )}
                            {step < STEP_FIELDS.length - 1 ? (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onPress={goNext}
                                    style={styles.navButton}
                                >
                                    {t('next')}
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    loading={isLoading}
                                    onPress={handleSignup}
                                    style={styles.navButton}
                                >
                                    {isLoading ? t('creatingAccount') : t('createAccount')}
                                </Button>
                            )}
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.linkText}>{t('signInLower')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
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
        marginTop: -Spacing.sm,
        marginBottom: Spacing.md,
    },
    fieldErrorText: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.error[500],
        marginTop: Spacing.xs,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorPalette.white,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: ColorPalette.gray[200],
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        ...Shadow.sm,
    },
    inputError: {
        borderColor: ColorPalette.error[500],
    },
    datePickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
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
    uploadRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
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
    uploadButtonHalf: {
        flex: 1,
    },
    uploadText: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.primary[500],
        marginTop: Spacing.sm,
        textAlign: 'center',
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
    navRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    navButton: {
        flex: 1,
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
