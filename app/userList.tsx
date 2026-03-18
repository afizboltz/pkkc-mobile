import { useTranslation } from "@/src/i18n";
import { getApprovedNewUsers } from "@/src/services/newUserApproval";
import dayjs from "dayjs";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from "@/src/theme";

export default function UserListScreen() {
    const [renewals, setRenewals] = useState<any[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { t } = useTranslation();

    const fetchRenewals = async () => {
        try {
            const data = await getApprovedNewUsers();
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
        return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Users List</title></head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif;">
            <h2 style="text-align:center;">${'Users List'}</h2>
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

    const filteredData = renewals.filter(u => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        return (u.userFullName || '').toLowerCase().includes(q) || (u.userEmail || '').toLowerCase().includes(q);
    });

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <Animated.View entering={FadeInUp.duration(400).delay(index * 50)}>
            <Card variant="elevated" padding="md" style={styles.itemCard}>
                <View style={styles.itemHeader}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={20} color={ColorPalette.primary[500]} />
                    </View>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.userFullName || 'N/A'}</Text>
                        <Text style={styles.itemEmail}>{item.userEmail || 'N/A'}</Text>
                    </View>
                </View>
                
                <View style={styles.itemDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={16} color={ColorPalette.gray[500]} />
                        <Text style={styles.detailText}>{item.phoneNo || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color={ColorPalette.gray[500]} />
                        <Text style={styles.detailText}>
                            {item.submittedAtMillis ? dayjs(item.submittedAtMillis).format('DD MMM YYYY HH:mm a') : item.submittedAt || 'N/A'}
                        </Text>
                    </View>
                </View>

                {(item.slipBayaranUrl || item.certificateUrl || item.screenshotUrl) ? (
                    <TouchableOpacity 
                        onPress={() => setPreviewUrl(item.slipBayaranUrl || item.certificateUrl || item.screenshotUrl)} 
                        style={styles.attachmentButton}
                    >
                        <Ionicons name="image-outline" size={18} color={ColorPalette.primary[500]} />
                        <Text style={styles.attachmentText}>{t('viewAttachment')}</Text>
                    </TouchableOpacity>
                ) : null}
            </Card>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInUp.duration(400)}>
                <View style={styles.searchContainer}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color={ColorPalette.gray[400]} />
                        <TextInput
                            placeholder={t('enterFullName')}
                            placeholderTextColor={ColorPalette.gray[400]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Ionicons name="close-circle" size={20} color={ColorPalette.gray[400]} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(400).delay(100)}>
                <View style={styles.headerRow}>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{renewals.length} Users</Text>
                    </View>
                    <Button 
                        variant="primary" 
                        size="sm"
                        onPress={onDownloadApprovedPdf}
                    >
                        <Ionicons name="download-outline" size={16} color={ColorPalette.white} />
                        PDF
                    </Button>
                </View>
            </Animated.View>

            {renewals.length > 0 ? (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search" size={48} color={ColorPalette.gray[300]} />
                            <Text style={styles.emptyText}>No results found</Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={48} color={ColorPalette.gray[300]} />
                    <Text style={styles.emptyText}>{t('noPendingRenewals')}</Text>
                </View>
            )}

            <Modal visible={!!previewUrl} transparent animationType="fade" onRequestClose={() => setPreviewUrl(null)}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity onPress={() => setPreviewUrl(null)} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={ColorPalette.white} />
                    </TouchableOpacity>
                    {previewUrl ? (
                        <Image source={{ uri: previewUrl }} resizeMode="contain" style={styles.modalImage} />
                    ) : null}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
        padding: Spacing.md,
    },
    searchContainer: {
        marginBottom: Spacing.md,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorPalette.white,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: ColorPalette.gray[200],
        ...Shadow.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.md,
        paddingLeft: Spacing.sm,
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[700],
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    countBadge: {
        backgroundColor: ColorPalette.primary[100],
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    countText: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.primary[700],
    },
    listContent: {
        paddingBottom: Spacing.xxl,
    },
    itemCard: {
        marginBottom: Spacing.md,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: ColorPalette.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    itemName: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[800],
    },
    itemEmail: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[500],
    },
    itemDetails: {
        backgroundColor: ColorPalette.gray[50],
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: 4,
    },
    detailText: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.gray[600],
    },
    attachmentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.sm,
        paddingVertical: Spacing.xs,
        backgroundColor: ColorPalette.primary[50],
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    attachmentText: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.primary[500],
        fontWeight: Typography.fontWeight.medium,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: Typography.fontSize.base,
        color: ColorPalette.gray[400],
        marginTop: Spacing.md,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.md,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: Spacing.sm,
    },
    modalImage: {
        width: '100%',
        height: '80%',
    },
});
