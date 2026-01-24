import { auth } from "@/src/config/firebase";
import { useTranslation } from "@/src/i18n";
import { approveNewUser, getPendingNewUsers, rejectNewUser } from "@/src/services/newUserApproval";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { Alert, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ApproveNewUserScreen() {

    const [users, setUsers] = React.useState<any[]>([]);
    const [remarks, setRemarks] = React.useState<Record<string, string>>({});
    const [loadingId, setLoadingId] = React.useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const { t } = useTranslation();

    const fetchUsers = async () => {
        try {
            const data = await getPendingNewUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers()
    }, []);



    const onApprove = async (item: any) => {
        try {
            setLoadingId(item.id);
            const by = auth?.currentUser?.email || auth?.currentUser?.uid || undefined;
            await approveNewUser({ userId: item.userEmail, remark: remarks[item.id], by });
            Alert.alert(t('approved'), `User ${item.id} approved.`);
            setRemarks((r) => ({ ...r, [item.id]: "" }));
            await fetchUsers();
        } catch (e: any) {
            console.error(e);
            Alert.alert(t('errorTitle'), e?.message || t('failedToApprove'));
        } finally {
            setLoadingId(null);
        }
    };

    const onReject = async (item: any) => {
        if (!remarks.hasOwnProperty(item.id) || remarks[item.id].length === 0) {
            Alert.alert('Alert', t('requiredRemark'));
            return;
        }
        try {
            setLoadingId(item.id);
            const by = auth?.currentUser?.email || auth?.currentUser?.uid || undefined;
            await rejectNewUser({ userId: item.userEmail, remark: remarks[item.id], by });
            Alert.alert(t('rejected'), `User ${item.id} rejected.`);
            setRemarks((r) => ({ ...r, [item.id]: "" }));
            await fetchUsers();
        } catch (e: any) {
            console.error(e);
            Alert.alert(t('errorTitle'), e?.message || t('failedToReject'));
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
            <TextInput
                placeholder={t('enterFullName')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 }}
            />
            {users.length > 0 ? (
                <View style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'left' }}>{t('totalPendingUserApproval')}: {users.length} </Text>
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
                renderItem={({ item }) => (
                    <View style={{ padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginVertical: 6 }}>
                        <Text>{t('user')}: {item.userFullName}</Text>
                        <Text>{t('email')}: {item.userEmail}</Text>
                        <Text>{t('submitted')}: {item.submittedAtMillis ? dayjs(item.submittedAtMillis).format('DD MMM YYYY HH:mm a') : item.submittedAt}</Text>

                        {(item.slipBayaranUrl || item.certificateUrl || item.screenshotUrl) ? (
                            <TouchableOpacity onPress={() => setPreviewUrl(item.slipBayaranUrl || item.certificateUrl || item.screenshotUrl)} style={{ marginTop: 8, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f1f5f9', borderRadius: 6 }}>
                                <Text style={{ color: '#0f172a' }}>{t('viewAttachment')}</Text>
                            </TouchableOpacity>
                        ) : null}

                        <TextInput
                            placeholder={t('remarkOptional')}
                            value={remarks[item.id] || ''}
                            onChangeText={(t) => setRemarks((r) => ({ ...r, [item.id]: t }))}
                            style={{ marginTop: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 }}
                            multiline
                            numberOfLines={4}
                        />

                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                            <TouchableOpacity disabled={loadingId === item.id} onPress={() => onApprove(item)} style={{ flex: 1, backgroundColor: '#22c55e', paddingVertical: 10, borderRadius: 6, alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontWeight: '600' }}>{loadingId === item.id ? t('processing') : t('approve')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={loadingId === item.id} onPress={() => onReject(item)} style={{ flex: 1, backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 6, alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontWeight: '600' }}>{loadingId === item.id ? t('processing') : t('reject')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        </View>
    );
}
