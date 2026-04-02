import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Platform, PlatformColor } from "react-native";

export default function ModalsLayout() {
    const foreground = useThemeColor('foreground');
    const background = useThemeColor('background');
    const surface = useThemeColor('surface');

    const sheetBg = Platform.OS === 'ios'
        ? PlatformColor('systemGroupedBackground')
        : background;

    const headerBg = Platform.OS === 'ios'
        ? PlatformColor('secondarySystemGroupedBackground')
        : surface;

    return (
        <Stack
            screenOptions={{
                contentStyle: { backgroundColor: sheetBg as any },
                headerStyle: { backgroundColor: headerBg as any },
                headerTitleStyle: {
                    color: foreground,
                    fontSize: 17,
                    fontWeight: '600',
                },
                headerTintColor: foreground,
                headerShadowVisible: false,
                gestureEnabled: true,
            }}
        >
            <Stack.Screen
                name="new-session"
                options={{ presentation: 'formSheet', headerTitle: 'Add Session' }}
            />
            <Stack.Screen
                name="edit-session"
                options={{ presentation: 'formSheet', headerTitle: 'Edit Session' }}
            />
            <Stack.Screen
                name="new-client"
                options={{ presentation: 'formSheet', headerTitle: 'Add Client' }}
            />
            <Stack.Screen
                name="invoice-config"
                options={{ presentation: 'formSheet', headerTitle: 'Invoice' }}
            />
            <Stack.Screen
                name="edit-client"
                options={{ presentation: 'formSheet', headerTitle: 'Edit Client' }}
            />
        </Stack>
    );
}
