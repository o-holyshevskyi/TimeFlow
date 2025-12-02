import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function CardsLayout() {
    return <Stack
        screenOptions={{
            headerShown: false,
            contentStyle: {
                backgroundColor: useThemeColor('background'),
            },
        }}
    >
        <Stack.Screen
            name="sessions-list"
            options={{
                presentation: 'card',
                headerShown: false
            }}
        />
    </Stack>
}