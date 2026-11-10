import { HapticTab } from '@/src/components/HapticTab';
import { useAccessLevel } from '@/src/hooks/useAccessLevel';
import { useTranslation } from '@/src/i18n';
import { ColorPalette } from '@/src/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, Tabs } from 'expo-router';
import React from 'react';

// Mockup shows all 5 tabs at all times, so guests see the same tab bar as
// members. Aduan & Profil are member-only: a guest's tap is intercepted
// here and redirected to login instead of changing tabs, so the guest never
// renders that tab's content (see GuestContext / useAccessLevel).
export default function TabsLayout() {
    const { t } = useTranslation();
    const accessLevel = useAccessLevel();

    const guardMemberOnlyTab = (e: { preventDefault: () => void }) => {
        if (accessLevel === 'guest') {
            e.preventDefault();
            router.push('/login');
        }
    };

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: ColorPalette.brandPink[500],
                tabBarInactiveTintColor: ColorPalette.gray[400],
                tabBarButton: HapticTab,
                tabBarStyle: { backgroundColor: ColorPalette.white },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: t('utama'),
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="program"
                options={{
                    title: t('program'),
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="event" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="aduan"
                listeners={{ tabPress: guardMemberOnlyTab }}
                options={{
                    title: t('aduan'),
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="report-problem" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="komuniti"
                options={{
                    title: t('komuniti'),
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="groups" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profil"
                listeners={{ tabPress: guardMemberOnlyTab }}
                options={{
                    title: t('profile'),
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
