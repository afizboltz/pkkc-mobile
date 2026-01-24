import { useTranslation } from "@/src/i18n";
import { getApprovedRenewals } from "@/src/services/renewMembership";
import dayjs from "dayjs";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect } from "react";
import { Alert, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RenewUserListScreen() {
    const [renewals, setRenewals] = React.useState<any[]>([]);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const { t } = useTranslation();

    const fetchRenewals = async () => {
        try {
            const data = await getApprovedRenewals();
            setRenewals(data);
        } catch (error) {
            console.error("Error fetching renewals:", error);
        }
    };

    useEffect(() => {
        fetchRenewals()
    }, []);

    const buildApprovedHtml = (items: any[]) => {
        const rows = items.map((it, idx) => `<tr><td style="padding:8px;border:1px solid #ddd;">${idx + 1}</td><td style="padding:8px;border:1px solid #ddd;">${it.userFullName || "-"}</td><td style="padding:8px;border:1px solid #ddd;">${it.userEmail || "-"}</td><td style="padding:8px;border:1px solid #ddd;">${it.approvedAtMillis ? new Date(it.approvedAtMillis).toLocaleString() : "-"}</td></tr>`).join("");
        return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Total Approved Renewal Users</title></head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif;">
            <h2 style="text-align:center;">${'Total Approved Renewal Users'}</h2>
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
            const items = await getApprovedRenewals();
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

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
            <TextInput
                placeholder={t('enterFullName')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 }}
            />
            {/* In case the header button isn't visible on some devices, also show an in-page action here */}
            <View style={{ alignSelf: 'flex-end', marginBottom: 12 }}>
                <TouchableOpacity onPress={onDownloadApprovedPdf} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#111827', borderRadius: 8 }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>Download PDF</Text>
                </TouchableOpacity>
            </View>
            {renewals.length > 0 ? (
                <View style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'left' }}>{t('totalApprovedRenewals')}: {renewals.length} </Text>
                </View>
            ) : (
                <Text>{t('noPendingRenewals')}</Text>
            )}
            <FlatList
                data={renewals.filter(u => {
                    const q = searchQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (u.userFullName || '').toLowerCase().includes(q) || (u.userEmail || '').toLowerCase().includes(q);
                })}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginVertical: 6 }}>
                        <Text>{t('user')}: {item.userFullName}</Text>
                        <Text>{t('email')}: {item.userEmail}</Text>
                        <Text>{t('submitted')}: {item.approvedAtMillis ? dayjs(item.approvedAtMillis).format('DD MMM YYYY HH:mm a') : (item.submittedAtMillis ? dayjs(item.submittedAtMillis).format('DD MMM YYYY HH:mm a') : item.submittedAt)}</Text>

                        {(item.slipBayaranUrl || item.certificateUrl || item.screenshotUrl) ? (
                            <TouchableOpacity onPress={() => setPreviewUrl(item.slipBayaranUrl || item.certificateUrl || item.screenshotUrl)} style={{ marginTop: 8, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f1f5f9', borderRadius: 6 }}>
                                <Text style={{ color: '#0f172a' }}>{t('viewAttachment')}</Text>
                            </TouchableOpacity>
                        ) : null}


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
