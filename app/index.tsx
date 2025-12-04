import { useAuth } from '@/src/hooks/useAuth';
import { printLog } from '@/src/utils/log';
import { useNavigation } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
    const navigation = useNavigation();
    const { user, userProfile, loading } = useAuth();

    printLog('loading', loading)


    navigation.reset({
        index: 0,
        routes: [
            {
                name: 'dashboard',
            },
        ],
    });
    // useEffect(() => {
    //     if (!loading) {
    //         if (!user) {
    //             navigation.reset({
    //                 index: 0,
    //                 routes: [
    //                     {
    //                         name: 'login',
    //                     },
    //                 ],
    //             });
    //         } else if (userProfile?.status === 'pending') {
    //             navigation.reset({
    //                 index: 0,
    //                 routes: [
    //                     {
    //                         name: 'pending',
    //                     },
    //                 ],
    //             });
    //         } else if (userProfile?.status === 'approved') {
    //             navigation.reset({
    //                 index: 0,
    //                 routes: [
    //                     {
    //                         name: 'dashboard',
    //                     },
    //                 ],
    //             });
    //         } else {
    //             navigation.reset({
    //                 index: 0,
    //                 routes: [
    //                     {
    //                         name: 'preLogin',
    //                     },
    //                 ],
    //             });
    //         }
    //     }
    // }, [user, userProfile, loading, navigation]);

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