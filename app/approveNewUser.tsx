import { auth } from "@/src/config/firebase";
import { useTranslation } from "@/src/i18n";
import { approveNewUser, getApprovedNewUsers, getPendingNewUsers, rejectNewUser } from "@/src/services/newUserApproval";
import * as Print from "expo-print";
import { useNavigation } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useLayoutEffect } from "react";
import { Alert, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ApproveRenewMembershipScreen() {
    const navigation = useNavigation();
    const [renewals, setRenewals] = React.useState<any[]>([]);
    const [remarks, setRemarks] = React.useState<Record<string, string>>({});
    const [loadingId, setLoadingId] = React.useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const { t } = useTranslation();

    const fetchRenewals = async () => {
        try {
            const data = await getPendingNewUsers();
            setRenewals(data);
            console.log("Pending renewals:", data);
        } catch (error) {
            console.error("Error fetching renewals:", error);
        }
    };

    useEffect(() => {
        fetchRenewals()
    }, []);

    const buildApprovedHtml = (items: any[]) => {
        const rows = items.map((it, idx) => `<tr><td style="padding:8px;border:1px solid #ddd;">${idx + 1}</td><td style="padding:8px;border:1px solid #ddd;">${it.userFullName || "-"}</td><td style="padding:8px;border:1px solid #ddd;">${it.userEmail || "-"}</td><td style="padding:8px;border:1px solid #ddd;">${it.approvedAtMillis ? new Date(it.approvedAtMillis).toLocaleString() : "-"}</td></tr>`).join("");
        return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Approved Users</title></head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif;">
            <h2 style="text-align:center;">${'Approved Users'}</h2>
            <p>Total: ${items.length}</p>
            <table style="border-collapse:collapse;width:100%;">
                <thead>
                    <tr>
                        <th style="padding:8px;border:1px solid #ddd;text-align:left;">#</th>
                        <th style="padding:8px;border:1px solid #ddd;text-align:left;">Name</th>
                        <th style="padding:8px;border:1px solid #ddd;text-align:left;">Email</th>
                        <th style="padding:8px;border:1px solid #ddd;text-align:left;">Approved At</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </body></html>`;
    };

    const onDownloadApprovedPdf = async () => {
        try {
            const items = await getApprovedNewUsers();
            if (!items || items.length === 0) {
                Alert.alert(t('error') || 'Info', t('noPendingRenewals') || 'No data');
                return;
            }
            const html = buildApprovedHtml(items);
            const file = await Print.printToFileAsync({ html });
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: 'Approved Users' });
            } else {
                Alert.alert('Saved', file.uri);
            }
        } catch (e: any) {
            console.error('PDF generation error', e);
            Alert.alert(t('error') || 'Error', e?.message || 'Failed to generate PDF');
        }
    };

    useLayoutEffect(() => {
        // Add header action to download PDF of approved renewals
        // @ts-ignore
        navigation.setOptions?.({
            headerRight: () => (
                <TouchableOpacity onPress={onDownloadApprovedPdf} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text style={{ color: '#0f172a', fontWeight: '600' }}>Download PDF</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const onApprove = async (item: any) => {
        try {
            setLoadingId(item.id);
            const by = auth?.currentUser?.email || auth?.currentUser?.uid || undefined;
            await approveNewUser({ userId: item.userEmail, remark: remarks[item.id], by });
            Alert.alert(t('approved'), `User ${item.id} approved.`);
            setRemarks((r) => ({ ...r, [item.id]: "" }));
            await fetchRenewals();
        } catch (e: any) {
            console.error(e);
            Alert.alert(t('errorTitle'), e?.message || t('failedToApprove'));
        } finally {
            setLoadingId(null);
        }
    };

    const onReject = async (item: any) => {
        try {
            setLoadingId(item.id);
            const by = auth?.currentUser?.email || auth?.currentUser?.uid || undefined;
            await rejectNewUser({ userId: item.userEmail, remark: remarks[item.id], by });
            Alert.alert(t('rejected'), `User ${item.id} rejected.`);
            setRemarks((r) => ({ ...r, [item.id]: "" }));
            await fetchRenewals();
        } catch (e: any) {
            console.error(e);
            Alert.alert(t('errorTitle'), e?.message || t('failedToReject'));
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
            {/* In case the header button isn't visible on some devices, also show an in-page action here */}
            <View style={{ alignSelf: 'flex-end', marginBottom: 12 }}>
                <TouchableOpacity onPress={onDownloadApprovedPdf} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#111827', borderRadius: 8 }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>Download PDF</Text>
                </TouchableOpacity>
            </View>
            {renewals.length > 0 ? (
                <View style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'left' }}>{t('totalPendingRenewals')}: {renewals.length} </Text>
                </View>
            ) : (
                <Text>{t('noPendingRenewals')}</Text>
            )}
            <FlatList
                data={renewals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginVertical: 6 }}>
                        <Text style={{ fontWeight: '600' }}>{t('user')}: {item.fullName}</Text>
                        <Text>{t('email')}: {item.userEmail}</Text>
                        <Text>{t('amount')}: RM {item.amount !== undefined ? item.amount : 'N/A'}.00</Text>
                        <Text>{t('idLabel')}: {item.id}</Text>
                        <Text>{t('submitted')}: {item.submittedAtMillis ? new Date(item.submittedAtMillis).toLocaleString() : item.submittedAt}</Text>

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
