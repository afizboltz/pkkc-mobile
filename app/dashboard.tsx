import { useAuth } from '@/src/hooks/useAuth';
import { logoutUser } from '@/src/services/auth';
import { useNavigation } from 'expo-router';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
    const { userProfile } = useAuth();
    const navigation = useNavigation();

    const handleSignOut = async () => {
        try {
            await logoutUser();
            navigation.reset({
                index: 0,
                routes: [{ name: 'preLogin' }], // or 'login'
            });
        } catch (e: any) {
            Alert.alert('Sign out failed', e?.message || 'Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Profile Section */}
            <View style={styles.profileCard}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/80' }}
                    style={styles.avatar}
                />
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>Hi, {userProfile?.fullName}</Text>
                    <Text style={styles.profileSub}>Persatuan Komuniti KITA Cybersouth</Text>
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
                    // navigation.navigate('events')
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
                }}>
                    <Text style={styles.menuLabel}>Marketplace</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => {
                    navigation.navigate('renewMembership')
                }}>
                    <Text style={styles.menuLabel}>Renew Membership</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => {
                    navigation.navigate('approveRenew')
                }}>
                    <Text style={styles.menuLabel}>Approve Renew</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.logoutContainer} onPress={() => {
                handleSignOut()
            }}>
                <Text style={styles.menuLabel}>Log out</Text>
            </TouchableOpacity>
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
        backgroundColor: '#696feac4',
        paddingVertical: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
    }
});
