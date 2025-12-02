/* eslint-disable react-hooks/rules-of-hooks */
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";

const IMAGE_SIZE = 28;

export const Icon = ({ name, color }: { name: string, color?: string }) => {
    const iconColor = color || useThemeColor('foreground');

    return <Ionicons name={name as any} size={IMAGE_SIZE} color={iconColor} />;
}