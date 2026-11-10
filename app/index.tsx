import { useAuth } from '@/src/hooks/useAuth';
import { getPostAuthRouteName } from '@/src/services/auth';
import { printLog } from '@/src/utils/log';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
    const { userProfile, loading } = useAuth();

    printLog('loading', loading)
    printLog('userProfile', userProfile)


    React.useEffect(() => {
        if (!loading) {
            router.replace(`/${getPostAuthRouteName(userProfile)}` as any);
        }
    }, [userProfile, loading]);


    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#3B82F6" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
});