import { KeyboardDismissView } from "@/src/components/KeyboardDismissView";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "@/src/i18n";
import { ClaimAgmCodeError, claimAgmCode } from "@/src/services/agmRegistration";
import { ColorPalette, Spacing, Typography } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";

export default function AgmRegisterScreen() {
    const { userProfile } = useAuth();
    const { t } = useTranslation();
    const navigation = useNavigation();

    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [registeredCode, setRegisteredCode] = useState<string | null>(null);

    const reasonMessage = (reason: ClaimAgmCodeError["reason"]) => {
        switch (reason) {
            case "no_active_event":
                return t("agmNoActiveEvent");
            case "already_registered":
                return t("agmErrorAlreadyRegistered");
            case "already_claimed":
                return t("agmErrorAlreadyClaimed");
            case "invalid_code":
                return t("agmErrorInvalidCode");
            case "not_authenticated":
                return t("agmErrorNotAuthenticated");
            default:
                return t("agmErrorUnknown");
        }
    };

    const onSubmit = async () => {
        if (!code.trim() || !userProfile) return;
        setSubmitting(true);
        setError(null);
        try {
            const claimed = await claimAgmCode(code.trim());
            setRegisteredCode(claimed.code);
        } catch (e) {
            if (e instanceof ClaimAgmCodeError) {
                setError(reasonMessage(e.reason));
            } else {
                setError(t("agmErrorUnknown"));
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (registeredCode) {
        return (
            <View style={styles.container}>
                <Card variant="elevated" padding="lg" style={styles.successCard}>
                    <Ionicons name="checkmark-circle" size={56} color={ColorPalette.success[500]} />
                    <Text style={styles.successTitle}>{t("agmRegisteredTitle")}</Text>
                    <Text style={styles.successCode}>{registeredCode}</Text>
                    <Button variant="primary" size="lg" fullWidth onPress={() => navigation.navigate("agm" as never)} style={styles.doneButton}>
                        {t("ok")}
                    </Button>
                </Card>
            </View>
        );
    }

    return (
        <KeyboardDismissView style={styles.container}>
            <Card variant="elevated" padding="lg">
                <Text style={styles.label}>{t("agmRegisterCodeLabel")}</Text>
                <TextInput
                    value={code}
                    onChangeText={(value) => setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    placeholder={t("agmEnterCodePlaceholder")}
                    placeholderTextColor={ColorPalette.gray[400]}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={6}
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={submitting}
                    disabled={!code.trim() || submitting}
                    onPress={onSubmit}
                    style={styles.submitButton}
                >
                    {submitting ? t("agmRegistering") : t("agmRegisterButton")}
                </Button>
            </Card>
        </KeyboardDismissView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
        padding: Spacing.md,
    },
    label: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[800],
        marginBottom: Spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: ColorPalette.gray[200],
        borderRadius: 12,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        letterSpacing: 4,
        textAlign: "center",
        color: ColorPalette.gray[900],
    },
    errorText: {
        color: ColorPalette.error[500],
        fontSize: Typography.fontSize.sm,
        marginTop: Spacing.sm,
        textAlign: "center",
    },
    submitButton: {
        marginTop: Spacing.lg,
    },
    successCard: {
        alignItems: "center",
    },
    successTitle: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
        marginTop: Spacing.md,
    },
    successCode: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.primary[500],
        letterSpacing: 4,
        marginTop: Spacing.xs,
    },
    doneButton: {
        marginTop: Spacing.lg,
    },
});
