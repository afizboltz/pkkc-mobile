import { useAuth } from '@/src/hooks/useAuth';
import { useTranslation } from '@/src/i18n';
import { logoutUser } from '@/src/services/auth';
import { getRenewalStatusFromProfile } from '@/src/services/renewMembership';
import { printLog } from '@/src/utils/log';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BorderRadius, ColorPalette, Shadow, Spacing, Typography } from '@/src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm) / 2;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface MenuItemProps {
    title: string;
    icon: string;
    color?: string;
    onPress: () => void;
    delay?: number;
}

const MenuCard: React.FC<MenuItemProps> = ({ title, icon, color = ColorPalette.primary[500], onPress, delay = 0 }) => {
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
        <Animated.View entering={FadeInUp.duration(400).delay(delay).springify()} style={animatedStyle}>
            <AnimatedTouchableOpacity 
                style={styles.menuItem} 
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <View style={[styles.menuIconContainer, { backgroundColor: `${color}15` }]}>
                    <MaterialIcons name={icon as any} size={24} color={color} />
                </View>
                <Text style={styles.menuLabel} numberOfLines={2}>{title}</Text>
            </AnimatedTouchableOpacity>
        </Animated.View>
    );
};

export default function DashboardScreen() {
    const { userProfile } = useAuth();
    const navigation = useNavigation();
    const { t, locale, setLocale } = useTranslation();

    const handleSignOut = async () => {
        try {
            await logoutUser();
            navigation.reset({
                index: 0,
                routes: [{ name: 'login' }],
            });
        } catch (e: any) {
            Alert.alert(t('signOutFailed'), e?.message || t('pleaseTryAgain'));
        }
    };

    const renewStatus = getRenewalStatusFromProfile(userProfile);
    printLog('renewStatus', renewStatus);

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View 
                style={styles.header}
                entering={FadeInDown.duration(500).springify()}
            >
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
            </Animated.View>

            <Animated.View 
                style={styles.switcherContainer}
                entering={FadeInDown.duration(400).delay(100)}
            >
                <TouchableOpacity
                    onPress={() => setLocale('ms')}
                    style={[styles.switchBtn, locale === 'ms' && styles.switchBtnActive]}
                >
                    <Text style={[styles.switchBtnText, locale === 'ms' && styles.switchBtnTextActive]}>BM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setLocale('en')}
                    style={[styles.switchBtn, locale === 'en' && styles.switchBtnActive]}
                >
                    <Text style={[styles.switchBtnText, locale === 'en' && styles.switchBtnTextActive]}>EN</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSignOut} style={styles.iconBtn}>
                    <MaterialIcons name="logout" size={18} color={ColorPalette.gray[600]} />
                </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(500).delay(200)}>
                <Text style={styles.sectionTitle}>Menu</Text>
            </Animated.View>

            <View style={styles.menuGrid}>
                <MenuCard 
                    title="Announcements" 
                    icon="campaign" 
                    color={ColorPalette.info[500]}
                    onPress={() => navigation.navigate('announcement')}
                    delay={300}
                />
                <MenuCard 
                    title="Organisation" 
                    icon="account-balance" 
                    color={ColorPalette.primary[500]}
                    onPress={() => navigation.navigate('organisation')}
                    delay={400}
                />
                <MenuCard 
                    title="Directory" 
                    icon="contacts" 
                    color={ColorPalette.tertiary[500]}
                    onPress={() => navigation.navigate('directory' as never)}
                    delay={500}
                />
                <MenuCard 
                    title={t('renewMembership')} 
                    icon="autorenew" 
                    color={ColorPalette.success[500]}
                    onPress={() => navigation.navigate('renewMembership' as never)}
                    delay={600}
                />
            </View>

            {userProfile?.role === 'admin' && (
                <Animated.View entering={FadeInUp.duration(500).delay(700)}>
                    <View style={styles.adminSection}>
                        <View style={styles.adminHeader}>
                            <MaterialIcons name="admin-panel-settings" size={20} color={ColorPalette.primary[500]} />
                            <Text style={styles.adminTitle}>{t('adminPanel')}</Text>
                        </View>
                        <View style={styles.menuGrid}>
                            <MenuCard 
                                title={t('approveRenew')} 
                                icon="fact-check" 
                                color={ColorPalette.warning[500]}
                                onPress={() => navigation.navigate('approveRenew')}
                                delay={800}
                            />
                            <MenuCard 
                                title={t('approveNewUser')} 
                                icon="person-add" 
                                color={ColorPalette.info[500]}
                                onPress={() => navigation.navigate('approveNewUser' as any)}
                                delay={900}
                            />
                            <MenuCard 
                                title={t('renewUserList')} 
                                icon="assignment" 
                                color={ColorPalette.success[500]}
                                onPress={() => navigation.navigate('renewUserList' as any)}
                                delay={1000}
                            />
                            <MenuCard 
                                title={t('userList')} 
                                icon="people" 
                                color={ColorPalette.primary[500]}
                                onPress={() => navigation.navigate('userList' as any)}
                                delay={1100}
                            />
                        </View>
                    </View>
                </Animated.View>
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
        backgroundColor: ColorPalette.primary[500],
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        ...Shadow.md,
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
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
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
        backgroundColor: ColorPalette.white,
        padding: 2,
        ...Shadow.sm,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.full,
        resizeMode: 'cover',
    },
    switcherContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    switchBtn: {
        paddingVertical: 4,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: ColorPalette.gray[200],
    },
    switchBtnActive: {
        backgroundColor: ColorPalette.primary[500],
    },
    switchBtnText: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
        color: ColorPalette.gray[600],
    },
    switchBtnTextActive: {
        color: ColorPalette.white,
    },
    iconBtn: {
        paddingVertical: 4,
        paddingHorizontal: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: ColorPalette.gray[200],
    },
    sectionTitle: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[800],
        marginBottom: Spacing.md,
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
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.sm,
    },
    menuIconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    menuLabel: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
        color: ColorPalette.gray[700],
        textAlign: 'center',
    },
    adminSection: {
        marginTop: Spacing.lg,
    },
    adminHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    adminTitle: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        color: ColorPalette.gray[800],
    },
    bottomSpacer: {
        height: Spacing.xl,
    },
});
