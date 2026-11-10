import { Button } from '@/src/components/ui';
import { PRIVACY_POLICY_URL } from '@/src/config/legal';
import { useGuest } from '@/src/contexts/GuestContext';
import { BorderRadius, ColorPalette, Spacing, Typography } from '@/src/theme';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function PreLoginScreen() {
    const { enterGuestMode } = useGuest();

    const handleGuest = () => {
        enterGuestMode();
        router.replace('/(tabs)/dashboard' as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoContainer}>
                    <Text style={styles.eyebrow}>PERSATUAN KOMUNITI KITA CYBERSOUTH</Text>
                    <Image source={require('../src/assets/images/entity/logo_pkkc.png')} style={styles.logoImage} />
                    <Text style={styles.brandTitle}>PKKC</Text>
                    <Text style={styles.eyebrow}>PERSATUAN KOMUNITI KITA CYBERSOUTH</Text>
                    <Text style={styles.tagline}>Komuniti Bersatu, Kita Lebih Maju</Text>
                </View>

                <View style={styles.bannerContainer}>
                    <Image
                        source={{ uri: 'https://picsum.photos/800/400?random=1' }}
                        style={styles.bannerImage}
                    />
                    <View style={styles.bannerOverlay}>
                        <Text style={styles.bannerText}>KITA @ CYBERSOUTH</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        variant="accent"
                        size="lg"
                        fullWidth
                        onPress={() => router.push('/login')}
                    >
                        Log Masuk
                    </Button>

                    <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        onPress={() => router.push('/signup')}
                    >
                        Daftar Akaun
                    </Button>

                    <Text style={styles.guestLink} onPress={handleGuest}>
                        Teruskan sebagai Tetamu
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Dengan meneruskan, anda bersetuju dengan Terma Perkhidmatan dan{' '}
                        <Text style={styles.footerLink} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                            Dasar Privasi
                        </Text>
                        {' '}kami.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.primary[500],
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxl,
        justifyContent: 'center',
        gap: Spacing.xl,
    },
    logoContainer: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    eyebrow: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.semibold,
        letterSpacing: 1,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    logoImage: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.lg,
        marginVertical: Spacing.xs,
    },
    brandTitle: {
        fontSize: Typography.fontSize.huge,
        fontWeight: Typography.fontWeight.extrabold,
        color: ColorPalette.white,
        letterSpacing: 1,
    },
    tagline: {
        textAlign: 'center',
        paddingHorizontal: Spacing.md,
        marginTop: Spacing.xs,
        color: 'rgba(255,255,255,0.85)',
        fontSize: Typography.fontSize.sm,
    },
    bannerContainer: {
        width: '100%',
        aspectRatio: 2,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: 'rgba(8,17,58,0.55)',
    },
    bannerText: {
        color: ColorPalette.white,
        fontWeight: Typography.fontWeight.bold,
        fontSize: Typography.fontSize.base,
        letterSpacing: 1,
    },
    buttonContainer: {
        gap: Spacing.md,
        width: '100%',
    },
    guestLink: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.85)',
        textDecorationLine: 'underline',
        paddingVertical: Spacing.xs,
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
    },
    footer: {
        alignItems: 'center',
        paddingTop: Spacing.sm,
    },
    footerText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
        paddingHorizontal: Spacing.lg,
        fontSize: Typography.fontSize.xs,
    },
    footerLink: {
        color: ColorPalette.white,
        textDecorationLine: 'underline',
    },
});