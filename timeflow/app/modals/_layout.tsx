import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function ModalsLayout() {
    const background = useThemeColor('background');
    const foreground = useThemeColor('foreground');
    const muted = useThemeColor('muted');
    const surface = useThemeColor('surface');

    return (
        <Stack
            screenOptions={{
                contentStyle: { backgroundColor: background },
                headerStyle: {
                    backgroundColor: surface,
                },
                headerTitleStyle: {
                    color: foreground,
                    fontSize: 17,
                    fontWeight: '700',
                },
                headerTintColor: foreground,
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="new-session"
                options={{ presentation: 'modal', headerTitle: 'Add Session' }}
            />
            <Stack.Screen
                name="edit-session"
                options={{ presentation: 'modal', headerTitle: 'Edit Session' }}
            />
            <Stack.Screen
                name="new-client"
                options={{ presentation: 'modal', headerTitle: 'Add Client' }}
            />
            <Stack.Screen
                name="invoice-config"
                options={{ presentation: 'modal', headerTitle: 'Invoice' }}
            />
            <Stack.Screen
                name="edit-client"
                options={{ presentation: 'modal', headerTitle: 'Edit Client' }}
            />
        </Stack>
    );
}
