import { Icon } from '@/components/ui/icon';
import { Tabs } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Platform, StyleSheet } from 'react-native';

export default function TabsLayout() {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const surface = useThemeColor('surface');

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: accent,
                tabBarInactiveTintColor: muted,
                tabBarStyle: {
                    backgroundColor: surface,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: 'rgba(84,84,88,0.4)',
                    height: Platform.OS === 'ios' ? 88 : 64,
                    paddingBottom: Platform.OS === 'ios' ? 32 : 8,
                    paddingTop: 8,
                    elevation: 0,
                },
                tabBarLabelStyle: {
                    fontFamily: 'System',
                    fontSize: 10,
                    fontWeight: '500',
                    letterSpacing: 0.1,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Timer',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? 'time' : 'time-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="sessions"
                options={{
                    title: 'Sessions',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? 'calendar' : 'calendar-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? 'settings' : 'settings-outline'} color={color} size={24} />
                    ),
                }}
            />
        </Tabs>
    );
}
