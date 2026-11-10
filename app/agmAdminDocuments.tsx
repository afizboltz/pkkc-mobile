import { KeyboardDismissView } from "@/src/components/KeyboardDismissView";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { isStaffRole, NotAuthorized } from "@/src/components/NotAuthorized";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "@/src/i18n";
import { getActiveAgmEvent } from "@/src/services/agmEvents";
import type { AgmDocumentCategory } from "@/src/services/agmDocuments";
import { listAgmDocuments, uploadAgmDocument } from "@/src/services/agmDocuments";
import { BorderRadius, ColorPalette, Spacing, Typography } from "@/src/theme";
import type { AgmDocumentRow } from "@/src/types/models";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const CATEGORIES: AgmDocumentCategory[] = ["agenda", "financial_statement", "resolution", "minutes", "other"];

export default function AgmAdminDocumentsScreen() {
    const { userProfile } = useAuth();
    const { t } = useTranslation();

    const [eventId, setEventId] = useState<string | null>(null);
    const [documents, setDocuments] = useState<AgmDocumentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<AgmDocumentCategory>("agenda");
    const [pickedFile, setPickedFile] = useState<{ uri: string; name: string } | null>(null);
    const [uploading, setUploading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const event = await getActiveAgmEvent();
            setEventId(event?.id ?? null);
            if (event) setDocuments(await listAgmDocuments(event.id));
        } catch (error) {
            console.error("Error loading AGM admin documents:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
        if (result.canceled || !result.assets?.[0]) return;
        setPickedFile({ uri: result.assets[0].uri, name: result.assets[0].name });
    };

    const onUpload = async () => {
        if (!eventId || !title.trim() || !pickedFile || !userProfile?.id) return;
        setUploading(true);
        try {
            await uploadAgmDocument({
                eventId,
                fileUri: pickedFile.uri,
                fileName: pickedFile.name,
                title: title.trim(),
                category,
                uploadedBy: userProfile.id,
            });
            setTitle("");
            setPickedFile(null);
            await load();
        } catch (error: any) {
            Alert.alert(t("error"), error?.message || t("agmErrorUnknown"));
        } finally {
            setUploading(false);
        }
    };

    if (!isStaffRole(userProfile?.role)) {
        return <NotAuthorized />;
    }

    return (
        <KeyboardDismissView style={styles.container}>
            <Card variant="elevated" padding="lg" style={styles.uploadCard}>
                <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t("agmDocumentTitleLabel")}
                    placeholderTextColor={ColorPalette.gray[400]}
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                />
                <Text style={styles.label}>{t("agmDocumentCategoryLabel")}</Text>
                <View style={styles.categoryRow}>
                    {CATEGORIES.map((c) => (
                        <TouchableOpacity
                            key={c}
                            onPress={() => setCategory(c)}
                            style={[styles.categoryChip, category === c && styles.categoryChipActive]}
                        >
                            <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextActive]}>
                                {c.replace("_", " ")}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Button variant="secondary" fullWidth onPress={pickFile} style={styles.pickButton}>
                    <Ionicons name="attach-outline" size={16} color={ColorPalette.gray[700]} />{" "}
                    {pickedFile ? pickedFile.name : t("agmPickPdfButton")}
                </Button>
                <Button
                    variant="primary"
                    fullWidth
                    loading={uploading}
                    disabled={!title.trim() || !pickedFile || uploading}
                    onPress={onUpload}
                    style={styles.uploadButton}
                >
                    {uploading ? t("agmUploading") : t("agmUploadButton")}
                </Button>
            </Card>

            {loading ? (
                <ActivityIndicator size="large" color={ColorPalette.primary[500]} style={styles.spinner} />
            ) : (
                <FlatList
                    data={documents}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                        <Card variant="outlined" padding="md" style={styles.docRow}>
                            <Ionicons name="document-outline" size={18} color={ColorPalette.primary[500]} />
                            <Text style={styles.docTitle}>{item.title}</Text>
                            <Text style={styles.docCategory}>{item.category.replace("_", " ")}</Text>
                        </Card>
                    )}
                />
            )}
        </KeyboardDismissView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
        padding: Spacing.md,
    },
    uploadCard: {
        marginBottom: Spacing.md,
    },
    input: {
        borderWidth: 1,
        borderColor: ColorPalette.gray[200],
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[900],
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[600],
        marginBottom: Spacing.xs,
    },
    categoryRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    categoryChip: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: ColorPalette.gray[100],
    },
    categoryChipActive: {
        backgroundColor: ColorPalette.primary[500],
    },
    categoryChipText: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.gray[700],
        textTransform: "capitalize",
    },
    categoryChipTextActive: {
        color: ColorPalette.white,
    },
    pickButton: {
        marginBottom: Spacing.sm,
    },
    uploadButton: {},
    spinner: {
        marginTop: Spacing.xl,
    },
    listContent: {
        paddingBottom: Spacing.xxl,
    },
    docRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    docTitle: {
        flex: 1,
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[800],
    },
    docCategory: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.gray[500],
        textTransform: "capitalize",
    },
});
