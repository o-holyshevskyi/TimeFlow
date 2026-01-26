import { Layout } from "@/constants/layout";
import { useThemeColor } from "heroui-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppText } from "../ui/app-text";
import { Icon } from "./icon"; // Переконайтеся, що шлях до вашої іконки правильний

// Палітра кольорів для клієнтів
const PRESET_COLORS = [
    '#2bee6c', // Ваш Accent
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#d946ef', // Fuchsia
    '#64748b', // Slate
];

type ColorSelectorProps = {
    selectedColor: string;
    onSelect: (color: string) => void;
    label?: string;
};

export const ColorSelector = ({ selectedColor, onSelect, label = "Color Marker" }: ColorSelectorProps) => {
    const foreground = useThemeColor('foreground');

    return (
        <View style={styles.container}>
            <AppText style={[styles.label, { color: foreground }]}>{label}</AppText>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {PRESET_COLORS.map((color) => {
                    const isSelected = selectedColor === color;
                    
                    return (
                        <TouchableOpacity
                            key={color}
                            activeOpacity={0.8}
                            onPress={() => onSelect(color)}
                            style={[
                                styles.circle,
                                { backgroundColor: color },
                                isSelected && styles.selectedCircle
                            ]}
                        >
                            {isSelected && (
                                <Icon name="checkmark" size={20} color={color === '#ffffff' ? 'white' : 'white'} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 8, // Відступ між лейблом і кружечками
    },
    label: {
        fontSize: 20,
    },
    scrollContent: {
        gap: 12,
        paddingVertical: Layout.spacing,
        paddingHorizontal: Layout.spacing
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCircle: {
        borderColor: 'white',
        transform: [{ scale: 1.2 }],
    }
});