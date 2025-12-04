import { useAuth } from '@/src/hooks/useAuth';
import { useNavigation } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text
} from 'react-native';

export default function ApprovalScreen() {
    const { signIn, loading } = useAuth();

    const navigation = useNavigation();


    return (
        <SafeAreaView style={styles.container}>
            <Text>approval scraeen</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
});