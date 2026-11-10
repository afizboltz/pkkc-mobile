import { useAuth } from '@/src/hooks/useAuth';
import { useTranslation } from '@/src/i18n';
import { getAnnouncements } from '@/src/services/announcement';
import { logoutUser } from '@/src/services/auth';
import { getPendingNewUsers } from '@/src/services/newUserApproval';
import { getPendingRenewals, getRenewalStatusFromProfile } from '@/src/services/renewMembership';
import { printLog } from '@/src/utils/log';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BorderRadius, ColorPalette, Spacing, Typography } from '@/src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm) / 2;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface MenuItemProps {
    title: string;
    icon: string;
    color?: string;
    onPress: () => void;
    badge?: number;
}

const MenuCard: React.FC<MenuItemProps> = ({ title, icon, color = ColorPalette.primary[500], onPress, badge }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Animated.View style={animatedStyle}>
            <AnimatedTouchableOpacity
                style={styles.menuItem}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <View style={styles.menuIconWrapper}>
                    <View style={[styles.menuIconContainer, { backgroundColor: color }]}>
                        <MaterialIcons name={icon as any} size={22} color={ColorPalette.white} />
                    </View>
                    {!!badge && badge > 0 && (
                        <View style={styles.menuBadge}>
                            <Text style={styles.menuBadgeText}>{badge > 99 ? '99+' : badge}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.menuLabel} numberOfLines={2}>{title}</Text>
            </AnimatedTouchableOpacity>
        </Animated.View>
    );
};

interface FeaturedTileProps {
    title: string;
    subtitle?: string | null;
    icon: string;
    color: string;
    onPress: () => void;
}

const FeaturedTile: React.FC<FeaturedTileProps> = ({ title, subtitle, icon, color, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <AnimatedTouchableOpacity
                style={styles.featuredTile}
                onPress={onPress}
                onPressIn={() => { scale.value = withSpring(0.97); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                activeOpacity={1}
            >
                <View style={[styles.featuredIconContainer, { backgroundColor: color }]}>
                    <MaterialIcons name={icon as any} size={22} color={ColorPalette.white} />
                </View>
                <View style={styles.featuredTextContainer}>
                    <Text style={styles.featuredTitle}>{title}</Text>
                    {subtitle ? (
                        <Text style={styles.featuredSubtitle} numberOfLines={1}>{subtitle}</Text>
                    ) : null}
                </View>
                <MaterialIcons name="chevron-right" size={22} color={ColorPalette.gray[400]} />
            </AnimatedTouchableOpacity>
        </Animated.View>
    );
};

export default function DashboardScreen() {
    const { userProfile } = useAuth();
    const navigation = useNavigation();
    const { t, locale, setLocale } = useTranslation();

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'ajk';

    const [latestAnnouncement, setLatestAnnouncement] = useState<string | null>(null);
    const [pendingRenewalCount, setPendingRenewalCount] = useState(0);
    const [pendingNewUserCount, setPendingNewUserCount] = useState(0);

    const handleSignOut = async () => {
        try {
            await logoutUser();
            router.replace('/login');
        } catch (e: any) {
            Alert.alert(t('signOutFailed'), e?.message || t('pleaseTryAgain'));
        }
    };

    const renewStatus = getRenewalStatusFromProfile(userProfile);
    printLog('renewStatus', renewStatus);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const announcements = await getAnnouncements();
                if (isMounted) setLatestAnnouncement(announcements[0]?.title ?? null);
            } catch (e: any) {
                printLog('dashboardAnnouncementFetchError', e?.message);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (!isAdmin) return;
        let isMounted = true;
        (async () => {
            try {
                const [renewals, newUsers] = await Promise.all([
                    getPendingRenewals(),
                    getPendingNewUsers(),
                ]);
                if (isMounted) {
                    setPendingRenewalCount(renewals.length);
                    setPendingNewUserCount(newUsers.length);
                }
            } catch (e: any) {
                printLog('dashboardPendingCountFetchError', e?.message);
            }
        })();
        return () => { isMounted = false; };
    }, [isAdmin]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <LinearGradient
                colors={[ColorPalette.primary[500], ColorPalette.primary[800]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerAccent} />
                <View style={styles.headerContent}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.greeting}>{t('hi')},</Text>
                        <Text style={styles.userName} numberOfLines={1}>{userProfile?.fullName}</Text>
                        <Text style={styles.associationName} numberOfLines={1}>{t('associationName')}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('profile' as never)}>
                        <Image
                            source={require('../src/assets/images/placeholder/userDefault.png')}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.switcherRow}>
                <View style={styles.segmentedControl}>
                    <Animated.View
                        layout={LinearTransition.duration(200)}
                        style={[styles.segmentThumb, locale === 'en' && styles.segmentThumbRight]}
                    />
                    <TouchableOpacity style={styles.segment} onPress={() => setLocale('ms')}>
                        <Text style={[styles.segmentText, locale === 'ms' && styles.segmentTextActive]}>BM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.segment} onPress={() => setLocale('en')}>
                        <Text style={[styles.segmentText, locale === 'en' && styles.segmentTextActive]}>EN</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={handleSignOut} style={styles.iconBtn}>
                    <MaterialIcons name="logout" size={16} color={ColorPalette.gray[600]} />
                </TouchableOpacity>
            </View>

            <View>
                <Text style={styles.sectionTitle}>Menu</Text>
            </View>

            <FeaturedTile
                title={t('announcements')}
                subtitle={latestAnnouncement}
                icon="campaign"
                color={ColorPalette.info[500]}
                onPress={() => navigation.navigate('announcement')}
            />

            <View style={styles.menuGrid}>
                <MenuCard
                    title={t('renewMembership')}
                    icon="autorenew"
                    color={ColorPalette.success[500]}
                    onPress={() => navigation.navigate('renewMembership' as never)}
                />
                <MenuCard
                    title={t('agm')}
                    icon="how-to-vote"
                    color={ColorPalette.warning[500]}
                    onPress={() => navigation.navigate('agm' as never)}
                />
            </View>

            {isAdmin && (
                <View style={styles.adminSection}>
                    <View style={styles.adminHeader}>
                        <MaterialIcons name="admin-panel-settings" size={20} color={ColorPalette.primary[700]} />
                        <Text style={styles.adminTitle}>{t('adminPanel')}</Text>
                    </View>
                    <View style={styles.menuGrid}>
                        <MenuCard
                            title={t('approveRenew')}
                            icon="fact-check"
                            color={ColorPalette.warning[500]}
                            onPress={() => navigation.navigate('approveRenew')}
                            badge={pendingRenewalCount}
                        />
                        <MenuCard
                            title={t('approveNewUser')}
                            icon="person-add"
                            color={ColorPalette.info[500]}
                            onPress={() => navigation.navigate('approveNewUser' as any)}
                            badge={pendingNewUserCount}
                        />
                        <MenuCard
                            title={t('renewUserList')}
                            icon="assignment"
                            color={ColorPalette.success[500]}
                            onPress={() => navigation.navigate('renewUserList' as any)}
                        />
                        <MenuCard
                            title={t('userList')}
                            icon="people"
                            color={ColorPalette.primary[500]}
                            onPress={() => navigation.navigate('userList' as any)}
                        />
                        <MenuCard
                            title={t('agmAdmin')}
                            icon="admin-panel-settings"
                            color={ColorPalette.warning[500]}
                            onPress={() => navigation.navigate('agmAdmin' as any)}
                        />
                    </View>
                </View>
            )}

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.gray[50],
    },
    scrollContent: {
        padding: Spacing.md,
    },
    header: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    headerAccent: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 999,
        backgroundColor: ColorPalette.white,
        opacity: 0.08,
        top: -60,
        right: -40,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    greeting: {
        fontSize: Typography.fontSize.sm,
        color: ColorPalette.white,
        opacity: 0.9,
    },
    userName: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.extrabold,
        color: ColorPalette.white,
    },
    associationName: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.white,
        opacity: 0.8,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        backgroundColor: 'rgba(255,255,255,0.12)',
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.full,
        resizeMode: 'cover',
    },
    switcherRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: ColorPalette.gray[100],
        borderRadius: BorderRadius.full,
        padding: 3,
    },
    segmentThumb: {
        position: 'absolute',
        top: 3,
        left: 3,
        bottom: 3,
        width: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: ColorPalette.primary[500],
    },
    segmentThumbRight: {
        left: 43,
    },
    segment: {
        width: 40,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    segmentText: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[600],
    },
    segmentTextActive: {
        color: ColorPalette.white,
    },
    iconBtn: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        backgroundColor: ColorPalette.gray[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
        marginBottom: Spacing.md,
    },
    featuredTile: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorPalette.white,
        borderWidth: 1,
        borderColor: ColorPalette.gray[200],
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    featuredIconContainer: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featuredTextContainer: {
        flex: 1,
    },
    featuredTitle: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.gray[900],
    },
    featuredSubtitle: {
        fontSize: Typography.fontSize.xs,
        color: ColorPalette.gray[500],
        marginTop: 2,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    menuItem: {
        width: BUTTON_WIDTH,
        backgroundColor: ColorPalette.white,
        borderWidth: 1,
        borderColor: ColorPalette.gray[200],
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIconWrapper: {
        marginBottom: Spacing.sm,
    },
    menuIconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuBadge: {
        position: 'absolute',
        top: -4,
        right: -6,
        minWidth: 18,
        height: 18,
        borderRadius: BorderRadius.full,
        backgroundColor: ColorPalette.error[500],
        borderWidth: 2,
        borderColor: ColorPalette.white,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    menuBadgeText: {
        fontSize: 10,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.white,
    },
    menuLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[800],
        textAlign: 'center',
    },
    adminSection: {
        marginTop: Spacing.xl,
        backgroundColor: ColorPalette.primary[50],
        borderWidth: 1,
        borderColor: ColorPalette.primary[100],
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
    },
    adminHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    adminTitle: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.bold,
        color: ColorPalette.primary[700],
    },
    bottomSpacer: {
        height: Spacing.xl,
    },
});
