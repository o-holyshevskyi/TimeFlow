import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function ModalsLayout() {
    return <Stack
        screenOptions={{
            contentStyle: {
                backgroundColor: useThemeColor('background'),
            },
            headerStyle: {
                backgroundColor: useThemeColor('background'),
            },
            headerTitleStyle: {
                color: useThemeColor('foreground'),
            }
        }}
    >
        <Stack.Screen
            name="new-session"
            options={{
                presentation: 'modal',
                headerTitle: 'Add New Session',
            }}
        />
        <Stack.Screen
            name="edit-session"
            options={{
                presentation: 'modal',
                headerTitle: 'Edit Session',
            }}
        />
    </Stack>
}