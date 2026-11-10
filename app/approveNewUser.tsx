import { supabase } from "@/src/config/supabase";
import { KeyboardDismissView } from "@/src/components/KeyboardDismissView";
import { isStaffRole, NotAuthorized } from "@/src/components/NotAuthorized";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { TextInput } from "@/src/components/ui/TextInput";
import { useAuth } from "@/src/hooks/useAuth";
import { useTranslation } from "@/src/i18n";
import { approveNewUser, getPendingNewUsers, rejectNewUser } from "@/src/services/newUserApproval";
import { logError } from "@/src/utils/log";
import { ColorPalette, Spacing, Typography } from "@/src/theme";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { Alert, FlatList, Image, Keyboard, Modal, Text, TouchableOpacity, View } from "react-native";

export default function ApproveNewUserScreen() {

    const [users, setUsers] = React.useState<any[]>([]);
    const [remarks, setRemarks] = React.useState<Record<string, string>>({});
    const [loadingId, setLoadingId] = React.useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const { userProfile } = useAuth();
    const { t } = useTranslation();

    const fetchUsers = async () => {
        try {
            const data = await getPendingNewUsers();
            setUsers(data);
        } catch (error) {
            logError('approveNewUser', 'Failed to fetch pending users', error as Error);
        }
    };

    useEffect(() => {
        fetchUsers()
    }, []);

    const openPreview = async (path: string) => {
        const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 60 * 5);
        if (error || !data) {
            logError('approveNewUser', 'Failed to load attachment', error as Error ?? undefined);
            Alert.alert(t('errorTitle'), t('failedToLoadAttachment'));
            return;
        }
        setPreviewUrl(data.signedUrl);
    };

    const doApprove = async (item: any) => {
        try {
            setLoadingId(item.id);
            const by = userProfile?.email || userProfile?.id || undefined;
            await approveNewUser({ userId: item.id, remark: remarks[item.id], by });
            Alert.alert(t('approved'), `${item.userFullName} — ${t('approved')}`);
            setRemarks((r) => ({ ...r, [item.id]: "" }));
            await fetchUsers();
        } catch (e: any) {
            logError('approveNewUser', 'Failed to approve user', e, { userId: item.id });
            Alert.alert(t('errorTitle'), t('failedToApprove'));
        } finally {
            setLoadingId(null);
        }
    };

    const doReject = async (item: any) => {
        try {
            setLoadingId(item.id);
            const by = userProfile?.email || userProfile?.id || undefined;
            await rejectNewUser({ userId: item.id, remark: remarks[item.id], by });
            Alert.alert(t('rejected'), `${item.userFullName} — ${t('rejected')}`);
            setRemarks((r) => ({ ...r, [item.id]: "" }));
            await fetchUsers();
        } catch (e: any) {
            logError('approveNewUser', 'Failed to reject user', e, { userId: item.id });
            Alert.alert(t('errorTitle'), t('failedToReject'));
        } finally {
            setLoadingId(null);
        }
    };

    const onApprove = (item: any) => {
        Alert.alert(
            `${t('confirmApproveTitlePrefix')} ${item.userFullName}?`,
            t('confirmApproveMessage'),
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('approve'), onPress: () => doApprove(item) },
            ]
        );
    };

    const onReject = (item: any) => {
        if (!remarks[item.id] || remarks[item.id].trim().length === 0) {
            Alert.alert('Alert', t('requiredRemark'));
            return;
        }
        Alert.alert(
            `${t('confirmRejectTitlePrefix')} ${item.userFullName}?`,
            t('confirmRejectMessage'),
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('reject'), style: 'destructive', onPress: () => doReject(item) },
            ]
        );
    };

    if (!isStaffRole(userProfile?.role)) {
        return <NotAuthorized />;
    }

    return (
        <KeyboardDismissView style={{ flex: 1, padding: Spacing.md, backgroundColor: ColorPalette.gray[50] }}>
            <TextInput
                placeholder={t('enterFullName')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                containerStyle={{ marginBottom: Spacing.md }}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
            />
            {users.length > 0 ? (
                <View style={{ alignSelf: 'flex-end', marginBottom: Spacing.md }}>
                    <Text style={{ fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold }}>{t('totalPendingUserApproval')}: {users.length} </Text>
                </View>
            ) : (
                <Text>{t('noPendingRenewals')}</Text>
            )}
            <FlatList
                data={users.filter(u => {
                    const q = searchQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (u.userFullName || '').toLowerCase().includes(q) || (u.userEmail || '').toLowerCase().includes(q);
                })}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                    <Card variant="outlined" padding="md" style={{ marginVertical: Spacing.sm }}>
                        <Text>{t('user')}: {item.userFullName}</Text>
                        <Text>{t('email')}: {item.userEmail}</Text>
                        <Text>{t('submitted')}: {item.submittedAtMillis ? dayjs(item.submittedAtMillis).format('DD MMM YYYY HH:mm a') : item.submittedAt}</Text>

                        {(item.slipBayaranUrl || item.certificateUrl || item.screenshotUrl) ? (
                            <TouchableOpacity onPress={() => openPreview(item.slipBayaranUrl || item.certificateUrl || item.screenshotUrl)} style={{ marginTop: Spacing.sm, alignSelf: 'flex-start', paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, backgroundColor: ColorPalette.gray[100], borderRadius: 6 }}>
                                <Text style={{ color: ColorPalette.gray[900] }}>{t('viewAttachment')}</Text>
                            </TouchableOpacity>
                        ) : null}

                        <TextInput
                            placeholder={t('remarkOptional')}
                            value={remarks[item.id] || ''}
                            onChangeText={(text) => setRemarks((r) => ({ ...r, [item.id]: text }))}
                            containerStyle={{ marginTop: Spacing.sm }}
                            multiline
                            numberOfLines={4}
                        />

                        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
                            <Button
                                variant="success"
                                disabled={loadingId === item.id}
                                loading={loadingId === item.id}
                                onPress={() => onApprove(item)}
                                style={{ flex: 1 }}
                            >
                                {t('approve')}
                            </Button>
                            <Button
                                variant="error"
                                disabled={loadingId === item.id}
                                loading={loadingId === item.id}
                                onPress={() => onReject(item)}
                                style={{ flex: 1 }}
                            >
                                {t('reject')}
                            </Button>
                        </View>
                    </Card>
                )}
            />

            <Modal visible={!!previewUrl} transparent animationType="fade" onRequestClose={() => setPreviewUrl(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                    <TouchableOpacity onPress={() => setPreviewUrl(null)} style={{ position: 'absolute', top: 40, right: 20, padding: 8 }}>
                        <Text style={{ color: 'white', fontSize: 16 }}>{t('close')}</Text>
                    </TouchableOpacity>
                    {previewUrl ? (
                        <Image source={{ uri: previewUrl }} resizeMode="contain" style={{ width: '100%', height: '80%' }} />
                    ) : null}
                </View>
            </Modal>
        </KeyboardDismissView>
    );
}
