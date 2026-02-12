import { ThemedText } from '@/src/components/ThemedText';
import { Button, Card } from '@/src/components/ui';
import { BorderRadius, ColorPalette, Spacing } from '@/src/theme';
import { useNavigation } from 'expo-router';
import React from 'react';
import {
    Image,
    SafeAreaView,
    StyleSheet,
    View
} from 'react-native';

export default function PreLoginScreen() {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Card variant="elevated" padding="lg" style={styles.logoCard}>
                        <Image source={require('../src/assets/images/entity/logo_pkkc.png')} style={styles.logoImage} />
                    </Card>
                    <ThemedText type="bodyMedium" style={styles.tagline}>
                        Stay connected with community and get the latest updates
                    </ThemedText>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={() => navigation.navigate('login' as never)}
                    >
                        Sign In
                    </Button>

                    <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        onPress={() => navigation.navigate('signup' as never)}
                    >
                        Sign Up
                    </Button>
                </View>

                <View style={styles.footer}>
                    <ThemedText type="caption" style={styles.footerText}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </ThemedText>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.white,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        justifyContent: 'center',
        gap: Spacing.xxl,
    },
    logoContainer: {
        alignItems: 'center',
        gap: Spacing.lg,
    },
    logoCard: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 140,
        height: 140,
        backgroundColor: ColorPalette.white,
    },
    logoImage: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.lg,
    },
    tagline: {
        textAlign: 'center',
        paddingHorizontal: Spacing.md,
        color: ColorPalette.gray[600],
    },
    buttonContainer: {
        gap: Spacing.md,
        width: '100%',
    },
    footer: {
        alignItems: 'center',
        paddingTop: Spacing.sm,
    },
    footerText: {
        textAlign: 'center',
        color: ColorPalette.gray[500],
        paddingHorizontal: Spacing.lg,
    },
});