import { Icon } from '@/components/ui/icon';
import { useThemeColor } from 'heroui-native';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const background = useThemeColor('background');
    const surface = useThemeColor('surface');

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: accent,
                tabBarInactiveTintColor: muted,
                tabBarStyle: {
                    backgroundColor: surface,
                    borderTopWidth: 1,
                    borderTopColor: muted + '25',
                    elevation: 0,
                    shadowOpacity: 0,
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    letterSpacing: 0.2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Timer',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? 'time' : 'time-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="sessions"
                options={{
                    title: 'Sessions',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? 'calendar' : 'calendar-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon name={focused ? 'settings' : 'settings-outline'} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
