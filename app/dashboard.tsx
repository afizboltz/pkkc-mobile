import { primaryColor } from '@/src/constants/Colors';
import { useAuth } from '@/src/hooks/useAuth';
import { useTranslation } from '@/src/i18n';
import { logoutUser } from '@/src/services/auth';
import { getRenewalStatusFromProfile } from '@/src/services/renewMembership';
import { printLog } from '@/src/utils/log';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
    const { userProfile } = useAuth();
    const navigation = useNavigation();
    const { t, locale, setLocale } = useTranslation();

    const handleSignOut = async () => {
        try {
            await logoutUser();
            navigation.reset({
                index: 0,
                routes: [{ name: 'login' }], // or 'login'
            });
        } catch (e: any) {
            Alert.alert(t('signOutFailed'), e?.message || t('pleaseTryAgain'));
        }
    };

    const renewStatus = getRenewalStatusFromProfile(userProfile);
    printLog('renewStatus', renewStatus);
    return (
        <View style={styles.container}>
            <View style={styles.switcherContainer}>
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
                    <MaterialIcons name="logout" size={22} color="#111827" />
                </TouchableOpacity>
            </View>
            {/* Profile Section */}
            <View style={styles.profileCard}>
                <Image
                    source={require('../src/assets/images/placeholder/userDefault.png')}
                    style={styles.avatar}
                />
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{t('hi')}, {userProfile?.fullName}</Text>
                    <Text style={styles.profileSub}>{t('associationName')}</Text>
                </View>
            </View>

            {/* Menu Section */}
            <View style={styles.menuGrid}>
                <TouchableOpacity style={styles.menuItem} onPress={() => {
                    navigation.navigate('announcement')
                }}>
                    <Text style={styles.menuLabel}>Announcements</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => {
                    navigation.navigate('organisation')
                }}>
                    <Text style={styles.menuLabel}>Organisation</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => {
                    navigation.navigate('directory' as never)
                }}>
                    <Text style={styles.menuLabel}>Directory</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity style={styles.menuItem} onPress={() => {
                    // navigation.navigate('events')
                    Alert.alert('Coming Soon')
                }}>
                    <Text style={styles.menuLabel}>Events</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => {
                    navigation.navigate('profile')
                }}>
                    <Text style={styles.menuLabel}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => {
                    navigation.navigate('marketplace')
                    // Alert.alert('Coming Soon');
                }}>
                    <Text style={styles.menuLabel}>Marketplace</Text>
                </TouchableOpacity> */}

                <TouchableOpacity style={styles.menuItem} onPress={() => {
                    // if (renewStatus === 'pending') {
                    //     Alert.alert(t('renewalStatus'), t('membershipPendingText'));
                    //     return;
                    // }

                    // if (renewStatus === 'completed') {
                    //     Alert.alert(t('renewalStatus'), t('membershipActiveText'));
                    //     return;
                    // }

                    navigation.navigate('renewMembership' as never)

                }}>
                    <Text style={styles.menuLabel}>{t('renewMembership')}</Text>
                </TouchableOpacity>

            </View>
            {userProfile?.role === 'admin' && (
                <View>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 10, marginTop: 20 }}>{t('adminPanel')}</Text>
                    <View style={{ ...styles.menuGrid, marginTop: 10 }}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            navigation.navigate('approveRenew')
                        }}>
                            <Text style={styles.menuLabel}>{t('approveRenew')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            navigation.navigate('approveNewUser' as any)
                        }}>
                            <Text style={styles.menuLabel}>{t('approveNewUser')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            navigation.navigate('renewUserList' as any)
                        }}>
                            <Text style={styles.menuLabel}>{t('renewUserList')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            navigation.navigate('userList' as any)
                        }}>
                            <Text style={styles.menuLabel}>{t('userList')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 16,
    },
    profileCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
        elevation: 2,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        resizeMode: 'cover',
    },
    profileInfo: {
        marginLeft: 12,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
    },
    profileSub: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    menuItem: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        paddingVertical: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    logoutContainer: {
        backgroundColor: primaryColor,
        paddingVertical: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto'
    },
    switcherContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginBottom: 12,
    },
    switchBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
    },
    switchBtnActive: {
        backgroundColor: '#111827',
    },
    switchBtnText: {
        color: '#111827',
        fontWeight: '600',
    },
    switchBtnTextActive: {
        color: 'white',
    },
    iconBtn: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
    }
});
