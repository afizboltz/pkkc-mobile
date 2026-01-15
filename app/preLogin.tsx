import { primaryColor, thirdaryColor } from '@/src/constants/Colors';
import { useNavigation } from 'expo-router';
import React from 'react';
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function PreLoginScreen() {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Image source={require('../src/assets/images/entity/pkkc.jpg')} style={styles.logoImage} />
                    </View>
                    <Text style={styles.tagline}>
                        Stay connected with community and get the latest updates
                    </Text>
                </View>

                <View style={styles.buttonContainer}>

                    <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('login')}>
                        <Text style={styles.primaryButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('signup')}>
                        <Text style={styles.secondaryButtonText}>Sign Up</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('pending')}>
                        <Text style={styles.secondaryButtonText}>Pending Approval</Text>
                    </TouchableOpacity> */}

                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 64,
    },
    logo: {
        width: 120,
        height: 120,
    },
    logoImage: {
        width: 120,
        height: 120,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    tagline: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        gap: 16,
        marginBottom: 32,
    },
    primaryButton: {
        backgroundColor: primaryColor,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: thirdaryColor,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: primaryColor,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: primaryColor,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 18,
    },
});