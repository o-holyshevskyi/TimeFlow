import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function ModalsLayout() {
    return <Stack
        screenOptions={{
            headerShown: false,
            contentStyle: {
                backgroundColor: useThemeColor('background'),
            },
        }}
    >
        <Stack.Screen
            name="new-session"
            options={{
                presentation: 'modal',
                headerShown: false,
            }}
        />
    </Stack>
}